import React from "react";

const PostRequestModal = ({ open, onClose, onSubmit, form, onChange, categories, availabilities }) => {
  const [newCategory, setNewCategory] = React.useState("");
  const [localCategories, setLocalCategories] = React.useState(categories);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [learningOutcome, setLearningOutcome] = React.useState("");
  const [tag, setTag] = React.useState("");
  const [universities, setUniversities] = React.useState([]);
  const [searchUniversity, setSearchUniversity] = React.useState("");
  const [showUniversityDropdown, setShowUniversityDropdown] = React.useState(false);
  const [dbCategories, setDbCategories] = React.useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = React.useState(false);
  const [isUniversityOpen, setIsUniversityOpen] = React.useState(false);
  
  React.useEffect(() => { setLocalCategories(categories); }, [categories]);
  
  // Fetch universities and categories
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch universities
        const uniResponse = await fetch('http://localhost:5000/api/universities');
        const uniData = await uniResponse.json();
        if (uniData.universities) {
          setUniversities(uniData.universities);
        }

        // Fetch categories
        const catResponse = await fetch('http://localhost:5000/api/categories');
        const catData = await catResponse.json();
        if (catData.categories) {
          setDbCategories(catData.categories);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    if (open) {
      fetchData();
    }
  }, [open]);

  // Filter universities based on search
  const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(searchUniversity.toLowerCase()) ||
    uni.location.toLowerCase().includes(searchUniversity.toLowerCase())
  );
  
  const selectUniversity = (university) => {
    onChange({
      target: {
        name: 'location',
        value: university.name
      }
    });
    setSearchUniversity(university.name);
    setShowUniversityDropdown(false);
  };
  
  const addLearningOutcome = () => {
    if (learningOutcome.trim()) {
      const currentOutcomes = form.whatYouWillLearn || [];
      onChange({
        target: {
          name: 'whatYouWillLearn',
          value: [...currentOutcomes, learningOutcome.trim()]
        }
      });
      setLearningOutcome("");
    }
  };

  const removeLearningOutcome = (index) => {
    const currentOutcomes = form.whatYouWillLearn || [];
    onChange({
      target: {
        name: 'whatYouWillLearn',
        value: currentOutcomes.filter((_, i) => i !== index)
      }
    });
  };

  const addTag = () => {
    if (tag.trim()) {
      const currentTags = form.tags || [];
      if (!currentTags.includes(tag.trim())) {
        onChange({
          target: {
            name: 'tags',
            value: [...currentTags, tag.trim()]
          }
        });
      }
      setTag("");
    }
  };

  const removeTag = (index) => {
    const currentTags = form.tags || [];
    onChange({
      target: {
        name: 'tags',
        value: currentTags.filter((_, i) => i !== index)
      }
    });
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-transparent">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6">Post a Request</h2>
        
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= 1 ? 'bg-[var(--color-accent)] text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
            <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-[var(--color-accent)]' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= 2 ? 'bg-[var(--color-accent)] text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
            <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-[var(--color-accent)]' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= 3 ? 'bg-[var(--color-accent)] text-white' : 'bg-gray-200 text-gray-600'}`}>3</div>
          </div>
          <div className="flex justify-between text-xs mt-2 text-gray-600">
            <span>Basic Info</span>
            <span>Details</span>
            <span>Contact</span>
          </div>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit} onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target.type !== 'submit') {
            e.preventDefault();
          }
        }}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <input type="text" name="title" value={form.title || ''} onChange={onChange} required placeholder="What help do you need?" className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-full" />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  {/* Collapsible Category Selector */}
                  <div className="w-full">
                    <div
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                      className="cursor-pointer rounded-xl px-4 py-3 flex justify-between items-center transition-all duration-200 hover:shadow-lg border border-gray-300"
                      style={{
                        background: 'var(--color-surface)',
                        color: 'var(--color-primary)',
                        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
                      }}
                    >
                      <span className="font-medium tracking-wide">
                        {form.category || 'Select Category'}
                      </span>
                      <div className="flex items-center gap-2">
                        {form.category && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onChange({ target: { name: 'category', value: '' } });
                            }}
                            className="text-xs text-red-400 hover:text-red-600 underline"
                          >
                            ✕
                          </button>
                        )}
                        <span className="text-gray-400 text-xs">
                          {isCategoryOpen ? "▲" : "▼"}
                        </span>
                      </div>
                    </div>

                    {/* Radio Button Options (shown when open) */}
                    {isCategoryOpen && (
                      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
                        {dbCategories.map(cat => (
                          <label key={cat._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                            <input
                              type="radio"
                              name="category"
                              value={cat.name}
                              checked={form.category === cat.name}
                              onChange={(e) => {
                                onChange(e);
                                setIsCategoryOpen(false);
                              }}
                              required
                              className="text-blue-600 focus:ring-blue-600"
                            />
                            <span className="text-gray-900 font-medium">{cat.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
                  <select name="skillLevel" value={form.skillLevel || 'Beginner'} onChange={onChange} className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-full">
                    <option value="Complete Beginner">Complete Beginner</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                  <select name="availability" value={form.availability || ''} onChange={onChange} required className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-full">
                    <option value="">When are you available?</option>
                    {availabilities.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
                  <select name="sessionType" value={form.sessionType || 'One-time'} onChange={onChange} className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-full">
                    <option value="One-time">One-time</option>
                    <option value="Multiple sessions">Multiple sessions</option>
                    <option value="Ongoing support">Ongoing support</option>
                  </select>
                </div>
              </div>

              <div id="university-container-request" className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                {/* Collapsible University Selector */}
                <div className="w-full">
                  <div
                    onClick={() => setIsUniversityOpen(!isUniversityOpen)}
                    className="cursor-pointer rounded-xl px-4 py-3 flex justify-between items-center transition-all duration-200 hover:shadow-lg border border-gray-300"
                    style={{
                      background: 'var(--color-surface)',
                      color: 'var(--color-primary)',
                      boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
                    }}
                  >
                    <span className="font-medium tracking-wide">
                      {searchUniversity || form.location || 'Select University'}
                    </span>
                    <div className="flex items-center gap-2">
                      {(searchUniversity || form.location) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchUniversity('');
                            onChange({ target: { name: 'location', value: '' } });
                          }}
                          className="text-xs text-red-400 hover:text-red-600 underline"
                        >
                          ✕
                        </button>
                      )}
                      <span className="text-gray-400 text-xs">
                        {isUniversityOpen ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {/* University Options (shown when open) */}
                  {isUniversityOpen && (
                    <div className="mt-2 relative">
                      <input
                        type="text"
                        value={searchUniversity}
                        onChange={(e) => {
                          setSearchUniversity(e.target.value);
                          setShowUniversityDropdown(true);
                        }}
                        onFocus={() => setShowUniversityDropdown(true)}
                        placeholder="Search your university"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none"
                        autoComplete="off"
                      />

                      {/* Dropdown */}
                      {showUniversityDropdown && filteredUniversities.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredUniversities.slice(0, 30).map((uni) => (
                            <div
                              key={uni._id}
                              onClick={() => {
                                selectUniversity(uni);
                                setIsUniversityOpen(false);
                              }}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{uni.name}</div>
                              <div className="text-sm text-gray-600">{uni.location}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type & Budget</label>
                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="isPaid" checked={form.isPaid || false} onChange={(e) => onChange({target: {name: 'isPaid', value: e.target.checked}})} /> Paid Request
                  </label>
                  {form.isPaid && (
                    <input 
                      type="number" 
                      name="price" 
                      value={form.price || ''} 
                      onChange={onChange} 
                      placeholder="Budget ($)" 
                      className="px-3 py-1 rounded border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-24"
                    />
                  )}
                </div>
              </div>

              <textarea name="description" value={form.description || ''} onChange={onChange} required placeholder="Brief description of what you need help with" className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none resize-none min-h-[100px] w-full" />
            </div>
          )}

          {/* Step 2: Detailed Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Duration</label>
                  <input type="text" name="sessionDuration" value={form.sessionDuration || ''} onChange={onChange} placeholder="e.g., 2 hours per session" className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Duration</label>
                  <input type="text" name="totalDuration" value={form.totalDuration || ''} onChange={onChange} placeholder="e.g., 2 weeks, 1 month" className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-full" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Method</label>
                  <select name="deliveryMethod" value={form.deliveryMethod || 'Both'} onChange={onChange} className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-full">
                    <option value="In-person">In-person</option>
                    <option value="Online">Online</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Schedule</label>
                  <input type="text" name="preferredSchedule" value={form.preferredSchedule || ''} onChange={onChange} placeholder="e.g., Weekends, 2-3 PM" className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-full" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prerequisites</label>
                <textarea name="prerequisites" value={form.prerequisites || ''} onChange={onChange} placeholder="What do you already know or have? Any specific requirements?" className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none resize-none min-h-[80px] w-full" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">What You Want to Learn</label>
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text" 
                    value={learningOutcome} 
                    onChange={(e) => setLearningOutcome(e.target.value)}
                    placeholder="Add learning goal"
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearningOutcome())}
                  />
                  <button type="button" onClick={addLearningOutcome} className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white font-bold shadow hover:opacity-90 transition">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(form.whatYouWillLearn || []).map((goal, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {goal}
                      <button type="button" onClick={() => removeLearningOutcome(index)} className="text-blue-600 hover:text-blue-800">&times;</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text" 
                    value={tag} 
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="Add tag"
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button type="button" onClick={addTag} className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white font-bold shadow hover:opacity-90 transition">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(form.tags || []).map((tagItem, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {tagItem}
                      <button type="button" onClick={() => removeTag(index)} className="text-green-600 hover:text-green-800">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact Information */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Review Your Request</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Title:</strong> {form.title}</p>
                  <p><strong>Category:</strong> {form.category}</p>
                  <p><strong>Type:</strong> {form.isPaid ? 'Paid' : 'Free'} {form.isPaid && form.price && `($${form.price} budget)`}</p>
                  <p><strong>Skill Level:</strong> {form.skillLevel}</p>
                  <p><strong>Session Type:</strong> {form.sessionType}</p>
                  <p><strong>Delivery:</strong> {form.deliveryMethod}</p>
                  {(form.whatYouWillLearn || []).length > 0 && (
                    <p><strong>Learning Goals:</strong> {(form.whatYouWillLearn || []).length} items</p>
                  )}
                </div>
              </div>

              <div className="text-center text-gray-600">
                <p>Once you submit this request, other users will be able to see it and offer to help you.</p>
                <p className="mt-2 text-sm">You can contact potential helpers through the platform messaging system.</p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            {currentStep > 1 && (
              <button 
                type="button" 
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-2 rounded-lg font-bold bg-gray-300 text-gray-700 shadow hover:bg-gray-400 transition"
              >
                Previous
              </button>
            )}
            
            {currentStep < 3 ? (
              <button 
                type="button" 
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-2 rounded-lg font-bold bg-[var(--color-accent)] text-white shadow hover:opacity-90 transition ml-auto"
              >
                Next
              </button>
            ) : (
              <button 
                type="submit" 
                className="px-6 py-2 rounded-lg font-bold bg-[var(--color-accent)] text-white shadow hover:opacity-90 transition ml-auto"
              >
                Submit Request
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostRequestModal;
