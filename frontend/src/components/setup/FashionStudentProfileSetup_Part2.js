// This file contains the remaining steps for FashionStudentProfileSetup.js
// Copy these functions into the main file after the renderBasicInformation function

// Step 2: Academic Information
const renderAcademicInformation = () => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Academic Information</h2>
      <p className="text-gray-600">Tell us about your educational background</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Institution <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.currentInstitution}
          onChange={(e) => handleInputChange('currentInstitution', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors.currentInstitution ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Parsons School of Design"
        />
        {errors.currentInstitution && <p className="text-red-500 text-sm mt-1">{errors.currentInstitution}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Institution Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.institutionLocation}
          onChange={(e) => handleInputChange('institutionLocation', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors.institutionLocation ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="New York, NY"
        />
        {errors.institutionLocation && <p className="text-red-500 text-sm mt-1">{errors.institutionLocation}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Degree Program <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.degreeProgram}
          onChange={(e) => handleInputChange('degreeProgram', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors.degreeProgram ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select your degree program</option>
          {degreePrograms.map((program) => (
            <option key={program} value={program}>{program}</option>
          ))}
        </select>
        {errors.degreeProgram && <p className="text-red-500 text-sm mt-1">{errors.degreeProgram}</p>}
      </div>

      {formData.degreeProgram === 'Other' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Degree Program
          </label>
          <input
            type="text"
            value={formData.customDegreeProgram}
            onChange={(e) => handleInputChange('customDegreeProgram', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your degree program"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Degree Level <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.degreeLevel}
          onChange={(e) => handleInputChange('degreeLevel', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors.degreeLevel ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select degree level</option>
          <option value="Associate">Associate</option>
          <option value="Bachelor">Bachelor</option>
          <option value="Master">Master</option>
          <option value="PhD">PhD</option>
          <option value="Certificate">Certificate</option>
          <option value="Diploma">Diploma</option>
        </select>
        {errors.degreeLevel && <p className="text-red-500 text-sm mt-1">{errors.degreeLevel}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Year <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.currentYear}
          onChange={(e) => handleInputChange('currentYear', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors.currentYear ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select current year</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
          <option value="4th Year">4th Year</option>
          <option value="5th Year">5th Year</option>
          <option value="Graduate">Graduate</option>
        </select>
        {errors.currentYear && <p className="text-red-500 text-sm mt-1">{errors.currentYear}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Expected Graduation <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData.expectedGraduation}
          onChange={(e) => handleInputChange('expectedGraduation', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors.expectedGraduation ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.expectedGraduation && <p className="text-red-500 text-sm mt-1">{errors.expectedGraduation}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current GPA (Optional)
        </label>
        <input
          type="text"
          value={formData.currentGPA}
          onChange={(e) => handleInputChange('currentGPA', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="e.g., 3.8/4.0"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Academic Achievements
      </label>
      <div className="space-y-2">
        {formData.academicAchievements.map((achievement, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              value={achievement}
              onChange={(e) => {
                const newAchievements = [...formData.academicAchievements];
                newAchievements[index] = e.target.value;
                handleInputChange('academicAchievements', newAchievements);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Dean's List Spring 2023"
            />
            <button
              onClick={() => removeFromArray('academicAchievements', index)}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={() => addToArray('academicAchievements', '')}
          className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50"
        >
          + Add Achievement
        </button>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Relevant Coursework
      </label>
      <div className="space-y-2">
        {formData.relevantCoursework.map((course, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              value={course}
              onChange={(e) => {
                const newCourses = [...formData.relevantCoursework];
                newCourses[index] = e.target.value;
                handleInputChange('relevantCoursework', newCourses);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Advanced Pattern Making"
            />
            <button
              onClick={() => removeFromArray('relevantCoursework', index)}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={() => addToArray('relevantCoursework', '')}
          className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50"
        >
          + Add Course
        </button>
      </div>
    </div>
  </div>
);

// Step 3: Specialization & Interests
const renderSpecialization = () => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Specialization & Interests</h2>
      <p className="text-gray-600">Define your fashion focus and creative interests</p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Primary Specialization <span className="text-red-500">*</span>
      </label>
      <select
        value={formData.primarySpecialization}
        onChange={(e) => handleInputChange('primarySpecialization', e.target.value)}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
          errors.primarySpecialization ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <option value="">Select your primary specialization</option>
        {specializations.map((spec) => (
          <option key={spec} value={spec}>{spec}</option>
        ))}
      </select>
      {errors.primarySpecialization && <p className="text-red-500 text-sm mt-1">{errors.primarySpecialization}</p>}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Secondary Specializations
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
        {specializations.filter(spec => spec !== formData.primarySpecialization).map((spec) => (
          <label key={spec} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.secondarySpecializations.includes(spec)}
              onChange={(e) => {
                if (e.target.checked) {
                  addToArray('secondarySpecializations', spec);
                } else {
                  const index = formData.secondarySpecializations.indexOf(spec);
                  removeFromArray('secondarySpecializations', index);
                }
              }}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm">{spec}</span>
          </label>
        ))}
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Design Philosophy <span className="text-red-500">*</span>
      </label>
      <textarea
        value={formData.designPhilosophy}
        onChange={(e) => handleInputChange('designPhilosophy', e.target.value)}
        rows={4}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
          errors.designPhilosophy ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder="Describe your design philosophy, what drives your creativity, and your unique perspective on fashion..."
      />
      {errors.designPhilosophy && <p className="text-red-500 text-sm mt-1">{errors.designPhilosophy}</p>}
      <p className="text-gray-500 text-sm mt-1">{formData.designPhilosophy.length}/1000 characters</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fashion Inspirations
        </label>
        <div className="space-y-2">
          {formData.inspirations.map((inspiration, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={inspiration}
                onChange={(e) => {
                  const newInspirations = [...formData.inspirations];
                  newInspirations[index] = e.target.value;
                  handleInputChange('inspirations', newInspirations);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Nature, Architecture, Street Art"
              />
              <button
                onClick={() => removeFromArray('inspirations', index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => addToArray('inspirations', '')}
            className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50"
          >
            + Add Inspiration
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Favorite Designers
        </label>
        <div className="space-y-2">
          {formData.favoriteDesigners.map((designer, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={designer}
                onChange={(e) => {
                  const newDesigners = [...formData.favoriteDesigners];
                  newDesigners[index] = e.target.value;
                  handleInputChange('favoriteDesigners', newDesigners);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Virgil Abloh, Rei Kawakubo"
              />
              <button
                onClick={() => removeFromArray('favoriteDesigners', index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => addToArray('favoriteDesigners', '')}
            className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50"
          >
            + Add Designer
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Step 4: Skills & Abilities
const renderSkills = () => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Skills & Abilities</h2>
      <p className="text-gray-600">Showcase your technical and creative skills</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Design Skills
        </label>
        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
          {designSkillsOptions.map((skill) => (
            <label key={skill} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.designSkills.includes(skill)}
                onChange={(e) => {
                  if (e.target.checked) {
                    addToArray('designSkills', skill);
                  } else {
                    const index = formData.designSkills.indexOf(skill);
                    removeFromArray('designSkills', index);
                  }
                }}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm">{skill}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Technical Skills
        </label>
        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
          {technicalSkillsOptions.map((skill) => (
            <label key={skill} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.technicalSkills.includes(skill)}
                onChange={(e) => {
                  if (e.target.checked) {
                    addToArray('technicalSkills', skill);
                  } else {
                    const index = formData.technicalSkills.indexOf(skill);
                    removeFromArray('technicalSkills', index);
                  }
                }}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm">{skill}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Software Skills
        </label>
        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
          {softwareSkillsOptions.map((skill) => (
            <label key={skill} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.softwareSkills.includes(skill)}
                onChange={(e) => {
                  if (e.target.checked) {
                    addToArray('softwareSkills', skill);
                  } else {
                    const index = formData.softwareSkills.indexOf(skill);
                    removeFromArray('softwareSkills', index);
                  }
                }}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm">{skill}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Business Skills
        </label>
        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
          {businessSkillsOptions.map((skill) => (
            <label key={skill} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.businessSkills.includes(skill)}
                onChange={(e) => {
                  if (e.target.checked) {
                    addToArray('businessSkills', skill);
                  } else {
                    const index = formData.businessSkills.indexOf(skill);
                    removeFromArray('businessSkills', index);
                  }
                }}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm">{skill}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Add these to the main component's render method:
// {currentStep === 2 && renderAcademicInformation()}
// {currentStep === 3 && renderSpecialization()}
// {currentStep === 4 && renderSkills()} 