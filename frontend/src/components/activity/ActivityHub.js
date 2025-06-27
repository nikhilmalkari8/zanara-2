import React, { useState } from 'react';
import EnhancedActivityFeed from './EnhancedActivityFeed';
import SmartActivityFeed from './SmartActivityFeed';
import PeopleYouMayKnow from './PeopleYouMayKnow';
import ProfileViewers from './ProfileViewers';
import TrendingHashtags from './TrendingHashtags';
import { Users, Eye, Activity, TrendingUp, Plus, Brain } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import MultiImageUpload from './MultiImageUpload';
import ConnectionStrengthAnalytics from '../connections/ConnectionStrengthAnalytics';
import Notifications from '../shared/Notifications';

const ActivityHub = ({ user, onUserClick }) => {
  const [activeTab, setActiveTab] = useState('smart-feed');
  const [showConnectionAnalytics, setShowConnectionAnalytics] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState(null);
  const [postImages, setPostImages] = useState([]);
  const [richContent, setRichContent] = useState('');
  const [creatingPost, setCreatingPost] = useState(false);
  const [activities, setActivities] = useState([]);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const tabs = [
    { id: 'smart-feed', label: 'Smart Feed', icon: Brain, description: 'AI-powered personalized content' },
    { id: 'feed', label: 'Activity Feed', icon: Activity, description: 'All recent activities' },
    { id: 'people', label: 'People You May Know', icon: Users, description: 'Expand your network' },
    { id: 'viewers', label: 'Profile Viewers', icon: Eye, description: 'Who viewed your profile' },
    { id: 'trending', label: 'Trending', icon: TrendingUp, description: 'What\'s popular now' },
  ];

  const handleConnect = (userId) => {
    console.log('Connection request sent to:', userId);
    // Handle connection logic here
  };

  const handleDismiss = (userId) => {
    console.log('Dismissed suggestion for:', userId);
    // Handle dismiss logic here
  };

  const handleHashtagClick = (hashtag) => {
    console.log('Hashtag clicked:', hashtag);
    // Handle hashtag search/filter
  };

  const handleCreatePost = async () => {
    if (!richContent.trim() && postImages.length === 0) return;

    try {
      setCreatingPost(true);

      const formData = new FormData();
      formData.append('content', richContent);
      formData.append('type', 'post');
      formData.append('visibility', 'public');

      // Add images
      postImages.forEach((image, index) => {
        if (image.file) {
          formData.append('media', image.file);
        }
      });

      // Add layout information for images
      if (postImages.length > 0) {
        formData.append('mediaLayout', JSON.stringify({
          type: 'grid',
          images: postImages.map(img => ({
            id: img.id,
            caption: img.caption,
            alt: img.alt
          }))
        }));
      }

      const response = await fetch('http://localhost:8001/api/activity', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const newActivity = await response.json();
        setActivities(prev => [newActivity, ...prev]);
        setRichContent('');
        setPostImages([]);
        setShowCreatePost(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setCreatingPost(false);
    }
  };

  const openConnectionAnalytics = (connectionId) => {
    setSelectedConnectionId(connectionId);
    setShowConnectionAnalytics(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Activity Hub</h1>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <span>•</span>
                <span>LinkedIn-level features</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  Week 2
                </span>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'feed' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header with Week 3 enhancements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Activity Hub</h1>
                  <p className="text-gray-600">Stay connected with your professional network</p>
                </div>
                
                {/* Quick Stats */}
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">{activities.length}</div>
                    <div className="text-xs text-gray-500">Activities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {activities.filter(a => a.engagement?.reactions?.length > 0).length}
                    </div>
                    <div className="text-xs text-gray-500">Engaged</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {new Set(activities.flatMap(a => a.engagement?.reactions?.map(r => r.user) || [])).size}
                    </div>
                    <div className="text-xs text-gray-500">Connections</div>
                  </div>
                </div>
              </div>

              {/* Create Post with Rich Editor */}
              {showCreatePost && (
                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Post</h3>
                  
                  {/* Rich Text Editor */}
                  <div className="mb-4">
                    <RichTextEditor
                      value={richContent}
                      onChange={setRichContent}
                      placeholder="Share your thoughts, insights, or updates..."
                      maxLength={2000}
                      showPreview={true}
                    />
                  </div>

                  {/* Multi-Image Upload */}
                  <div className="mb-4">
                    <MultiImageUpload
                      images={postImages}
                      onImagesChange={setPostImages}
                      maxImages={10}
                      allowCropping={true}
                      allowReordering={true}
                      layoutOptions={true}
                    />
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {richContent.length}/2000 characters
                      </span>
                      {postImages.length > 0 && (
                        <span className="text-sm text-gray-500">
                          {postImages.length} image{postImages.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setShowCreatePost(false);
                          setRichContent('');
                          setPostImages([]);
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreatePost}
                        disabled={creatingPost || (!richContent.trim() && postImages.length === 0)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                      >
                        {creatingPost && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        <span>{creatingPost ? 'Publishing...' : 'Publish'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Create Button */}
              {!showCreatePost && (
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Share something with your network</span>
                </button>
              )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Sidebar */}
              <div className="space-y-6">
                <TrendingHashtags />
                <PeopleYouMayKnow 
                  user={user} 
                  onConnectionAnalytics={openConnectionAnalytics}
                />
              </div>

              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-6">
                <EnhancedActivityFeed 
                  user={user}
                  activities={activities}
                  onActivitiesUpdate={setActivities}
                  onConnectionAnalytics={openConnectionAnalytics}
                />
              </div>
            </div>

            {/* Right Sidebar - Profile Viewers */}
            <div className="lg:col-span-1">
              <ProfileViewers user={user} />
            </div>
          </div>
        )}

        {activeTab === 'smart-feed' && (
          <div className="space-y-6">
            {/* Smart Feed Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold flex items-center">
                    <Brain className="w-8 h-8 mr-3" />
                    Smart Feed
                  </h1>
                  <p className="text-purple-100 mt-1">
                    AI-powered personalized content just for you
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold">🧠</div>
                  <div className="text-sm text-purple-100">Phase 2</div>
                </div>
              </div>
              
              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-lg font-semibold">Connection Strength</div>
                  <div className="text-sm text-purple-100">Content ranked by your relationships</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-lg font-semibold">Industry Relevance</div>
                  <div className="text-sm text-purple-100">Tailored to your professional interests</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-lg font-semibold">A/B Testing</div>
                  <div className="text-sm text-purple-100">Continuously improving algorithms</div>
                </div>
              </div>
            </div>

            {/* Smart Feed Component */}
            <SmartActivityFeed 
              user={user}
              onUserClick={onUserClick}
            />
          </div>
        )}

        {activeTab === 'people' && (
          <div className="max-w-4xl mx-auto">
            <PeopleYouMayKnow 
              user={user} 
              onConnect={handleConnect}
              onDismiss={handleDismiss}
            />
          </div>
        )}

        {activeTab === 'viewers' && (
          <div className="max-w-4xl mx-auto">
            <ProfileViewers user={user} />
          </div>
        )}

        {activeTab === 'trending' && (
          <div className="max-w-4xl mx-auto">
            <TrendingHashtags 
              user={user} 
              onHashtagClick={handleHashtagClick}
            />
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-4 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-3 ${
                  activeTab === tab.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Connection Analytics Modal */}
      {showConnectionAnalytics && selectedConnectionId && (
        <ConnectionStrengthAnalytics
          user={user}
          connectionId={selectedConnectionId}
          onClose={() => {
            setShowConnectionAnalytics(false);
            setSelectedConnectionId(null);
          }}
        />
      )}

      {/* Notifications Panel */}
      <Notifications 
        user={user}
        onConnectionAnalytics={openConnectionAnalytics}
      />
    </div>
  );
};

export default ActivityHub; 