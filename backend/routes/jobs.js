const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const User = require('../models/User');
const Contract = require('../models/Contract');

// Browse jobs with advanced filtering and smart matching
router.get('/browse', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      jobType,
      workFormat,
      location,
      compensation,
      experience,
      search,
      targetType,
      sort = 'relevance',
      featured,
      urgent,
      salaryMin,
      salaryMax,
      skills,
      userId // For personalized matching
    } = req.query;

    // Build query
    let query = { 
      status: 'published',
      $or: [
        { 'applicationProcess.deadline': { $gte: new Date() } },
        { 'applicationProcess.deadline': { $exists: false } }
      ]
    };

    // Apply filters
    if (category && category !== 'all') {
      query.category = category;
    }

    if (jobType && jobType !== 'all') {
      query.jobType = jobType;
    }

    if (workFormat && workFormat !== 'all') {
      query.workFormat = workFormat;
    }

    if (location && location !== 'all') {
      query.$or = [
        { 'location.city': new RegExp(location, 'i') },
        { 'location.country': new RegExp(location, 'i') },
        { workFormat: 'remote' }
      ];
    }

    if (compensation && compensation !== 'all') {
      query['compensation.type'] = compensation;
    }

    if (experience && experience !== 'all') {
      query['requirements.experience.level'] = experience;
    }

    if (targetType && targetType !== 'all') {
      query.targetProfessionalTypes = { $in: [targetType] };
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (urgent === 'true') {
      query.urgent = true;
    }

    if (salaryMin || salaryMax) {
      query['compensation.amount'] = {};
      if (salaryMin) query['compensation.amount.min'] = { $gte: parseInt(salaryMin) };
      if (salaryMax) query['compensation.amount.max'] = { $lte: parseInt(salaryMax) };
    }

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query['requirements.skills.required'] = { $in: skillsArray };
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    let sortOptions = {};
    switch (sort) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'deadline':
        sortOptions = { 'applicationProcess.deadline': 1 };
        break;
      case 'salary-high':
        sortOptions = { 'compensation.amount.max': -1 };
        break;
      case 'salary-low':
        sortOptions = { 'compensation.amount.min': 1 };
        break;
      case 'relevance':
      default:
        sortOptions = { featured: -1, urgent: -1, createdAt: -1 };
    }

    // Execute query
    const jobs = await Job.find(query)
      .populate('postedBy', 'firstName lastName profilePicture')
      .populate('company', 'companyName logo location')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-applications -bidding.bids');

    // Add match scores if userId provided
    let jobsWithScores = jobs;
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        jobsWithScores = jobs.map(job => {
          const jobObj = job.toObject();
          jobObj.matchScore = job.calculateMatchScore(user);
          return jobObj;
        });

        // Sort by match score if relevance sort
        if (sort === 'relevance') {
          jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);
        }
      }
    }

    const total = await Job.countDocuments(query);

    // Get category breakdown
    const categoryBreakdown = await Job.aggregate([
      { $match: { ...query, category: { $exists: true } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      jobs: jobsWithScores,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasMore: page * limit < total,
      categoryBreakdown: categoryBreakdown.reduce((acc, cat) => {
        acc[cat._id] = cat.count;
        return acc;
      }, {})
    });

  } catch (error) {
    console.error('Browse jobs error:', error);
    res.status(500).json({ message: 'Server error browsing jobs' });
  }
});

// Get job details
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'firstName lastName profilePicture email')
      .populate('company', 'companyName logo location website description')
      .populate('applications.applicant', 'firstName lastName profilePicture professionalType');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Increment view count
    job.views += 1;
    await job.save();

    // Prepare response based on user access
    let responseData = job.toObject();

    // Check if user is job poster
    const token = req.headers.authorization?.split(' ')[1];
    let currentUser = null;
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUser = await User.findById(decoded.userId);
      } catch (e) {
        // Invalid token, continue as guest
      }
    }

    const isJobPoster = currentUser && job.postedBy._id.toString() === currentUser._id.toString();
    const hasApplied = currentUser && job.applications.some(app => 
      app.applicant._id.toString() === currentUser._id.toString()
    );

    if (!isJobPoster) {
      // Remove sensitive information for non-posters
      responseData.applications = responseData.applications.map(app => ({
        _id: app._id,
        status: app.status,
        submittedAt: app.submittedAt
      }));
    }

    // Add user-specific data
    responseData.canApply = currentUser ? job.canUserApply(currentUser._id) : false;
    responseData.hasApplied = hasApplied;
    responseData.userApplication = hasApplied ? job.getUserApplication(currentUser._id) : null;
    responseData.matchScore = currentUser ? job.calculateMatchScore(currentUser) : null;

    res.json(responseData);

  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error fetching job' });
  }
});

// Create new job
router.post('/create', auth, async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.userId
    };

    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'jobType', 'compensation'];
    for (const field of requiredFields) {
      if (!jobData[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    const job = new Job(jobData);
    await job.save();

    await job.populate('postedBy', 'firstName lastName profilePicture');
    await job.populate('company', 'companyName logo');

    res.status(201).json({
      message: 'Job created successfully',
      job
    });

  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error creating job' });
  }
});

// Update job
router.put('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership
    if (job.postedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    // Update job
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        job[key] = req.body[key];
      }
    });

    job.updatedAt = new Date();
    await job.save();

    res.json({
      message: 'Job updated successfully',
      job
    });

  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error updating job' });
  }
});

// Apply to job
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const { coverLetter, customAnswers, portfolioUrls, documents } = req.body;
    
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user can apply
    if (!job.canUserApply(req.userId)) {
      return res.status(400).json({ message: 'Cannot apply to this job' });
    }

    // Add application
    job.applications.push({
      applicant: req.userId,
      coverLetter,
      customAnswers,
      portfolioUrls,
      documents
    });

    await job.save();

    res.json({
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error('Apply to job error:', error);
    res.status(500).json({ message: 'Server error submitting application' });
  }
});

// Submit bid (for bidding-enabled jobs)
router.post('/:id/bid', auth, async (req, res) => {
  try {
    const { amount, proposal, timeline } = req.body;
    
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (!job.bidding.enabled) {
      return res.status(400).json({ message: 'Bidding not enabled for this job' });
    }

    if (job.bidding.biddingDeadline && new Date() > job.bidding.biddingDeadline) {
      return res.status(400).json({ message: 'Bidding deadline has passed' });
    }

    // Check if user already bid
    const existingBid = job.bidding.bids.find(bid => 
      bid.bidder.toString() === req.userId
    );

    if (existingBid) {
      return res.status(400).json({ message: 'You have already submitted a bid' });
    }

    // Add bid
    job.bidding.bids.push({
      bidder: req.userId,
      amount,
      proposal,
      timeline
    });

    await job.save();

    res.json({
      message: 'Bid submitted successfully'
    });

  } catch (error) {
    console.error('Submit bid error:', error);
    res.status(500).json({ message: 'Server error submitting bid' });
  }
});

// Accept bid
router.post('/:id/accept-bid/:bidId', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership
    if (job.postedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const bid = job.bidding.bids.id(req.params.bidId);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Accept the bid
    bid.status = 'accepted';
    job.bidding.winningBid = bid.bidder;
    job.status = 'filled';

    // Reject other bids
    job.bidding.bids.forEach(otherBid => {
      if (otherBid._id.toString() !== req.params.bidId) {
        otherBid.status = 'rejected';
      }
    });

    await job.save();

    // Create contract automatically
    const contract = new Contract({
      title: `Contract for ${job.title}`,
      job: job._id,
      client: job.postedBy,
      professional: bid.bidder,
      type: 'project-based',
      scope: {
        description: job.description,
        timeline: {
          startDate: new Date(),
          endDate: job.timeline.endDate
        }
      },
      financial: {
        totalAmount: bid.amount,
        currency: job.compensation.amount?.currency || 'USD',
        paymentStructure: 'milestone'
      }
    });

    await contract.save();

    res.json({
      message: 'Bid accepted successfully',
      contractId: contract.contractId
    });

  } catch (error) {
    console.error('Accept bid error:', error);
    res.status(500).json({ message: 'Server error accepting bid' });
  }
});

// Get user's jobs (posted)
router.get('/user/posted', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = { postedBy: req.userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const jobs = await Job.find(query)
      .populate('company', 'companyName logo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('Get posted jobs error:', error);
    res.status(500).json({ message: 'Server error fetching posted jobs' });
  }
});

// Get user's applications
router.get('/user/applications', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = { 'applications.applicant': req.userId };
    if (status && status !== 'all') {
      query['applications.status'] = status;
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'firstName lastName profilePicture')
      .populate('company', 'companyName logo')
      .sort({ 'applications.submittedAt': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Extract user's applications
    const applications = jobs.map(job => {
      const userApp = job.applications.find(app => 
        app.applicant.toString() === req.userId
      );
      return {
        _id: userApp._id,
        job: {
          _id: job._id,
          title: job.title,
          company: job.company,
          postedBy: job.postedBy,
          compensation: job.compensation,
          location: job.location
        },
        status: userApp.status,
        submittedAt: userApp.submittedAt,
        coverLetter: userApp.coverLetter
      };
    });

    const total = await Job.countDocuments(query);

    res.json({
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
});

// Get job recommendations for user
router.get('/user/recommendations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build recommendation query
    let query = {
      status: 'published',
      targetProfessionalTypes: { $in: [user.professionalType] },
      $or: [
        { 'applicationProcess.deadline': { $gte: new Date() } },
        { 'applicationProcess.deadline': { $exists: false } }
      ]
    };

    // Exclude jobs user already applied to
    const appliedJobs = await Job.find({
      'applications.applicant': req.userId
    }).select('_id');

    if (appliedJobs.length > 0) {
      query._id = { $nin: appliedJobs.map(job => job._id) };
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'firstName lastName profilePicture')
      .populate('company', 'companyName logo')
      .limit(20)
      .sort({ featured: -1, urgent: -1, createdAt: -1 });

    // Calculate match scores and sort
    const jobsWithScores = jobs.map(job => {
      const jobObj = job.toObject();
      jobObj.matchScore = job.calculateMatchScore(user);
      return jobObj;
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      recommendations: jobsWithScores.slice(0, 10)
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error fetching recommendations' });
  }
});

// Save/unsave job
router.post('/:id/save', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const existingSave = job.saves.find(save => 
      save.user.toString() === req.userId
    );

    if (existingSave) {
      // Unsave
      job.saves = job.saves.filter(save => 
        save.user.toString() !== req.userId
      );
      await job.save();
      res.json({ message: 'Job unsaved', saved: false });
    } else {
      // Save
      job.saves.push({ user: req.userId });
      await job.save();
      res.json({ message: 'Job saved', saved: true });
    }

  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({ message: 'Server error saving job' });
  }
});

// Get saved jobs
router.get('/user/saved', auth, async (req, res) => {
  try {
    const jobs = await Job.find({
      'saves.user': req.userId,
      status: 'published'
    })
    .populate('postedBy', 'firstName lastName profilePicture')
    .populate('company', 'companyName logo')
    .sort({ 'saves.savedAt': -1 });

    res.json({ savedJobs: jobs });

  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({ message: 'Server error fetching saved jobs' });
  }
});

// Get job statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const stats = {
      totalJobs: await Job.countDocuments({ status: 'published' }),
      myPostedJobs: await Job.countDocuments({ postedBy: req.userId }),
      myApplications: await Job.countDocuments({ 'applications.applicant': req.userId }),
      savedJobs: await Job.countDocuments({ 'saves.user': req.userId })
    };

    // Category breakdown
    const categoryStats = await Job.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    stats.byCategory = categoryStats.reduce((acc, cat) => {
      acc[cat._id] = cat.count;
      return acc;
    }, {});

    res.json(stats);

  } catch (error) {
    console.error('Get job stats error:', error);
    res.status(500).json({ message: 'Server error fetching job statistics' });
  }
});

module.exports = router; 