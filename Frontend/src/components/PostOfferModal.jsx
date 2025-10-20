import React from "react";

const PostOfferModal = ({ open, onClose, onSubmit, form, onChange, categories, availabilities }) => {
  const [newCategory, setNewCategory] = React.useState("");
  const [localCategories, setLocalCategories] = React.useState(categories);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [learningOutcome, setLearningOutcome] = React.useState("");
  const [tag, setTag] = React.useState("");
  
  React.useEffect(() => { setLocalCategories(categories); }, [categories]);
  
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
        <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6">Post an Offer</h2>
        
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
              <input type="text" name="title" value={form.title || ''} onChange={onChange} required placeholder="Skill/Service Title" className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-full" />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <div className="flex gap-2">
                    <select name="category" value={form.category || ''} onChange={onChange} required className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none flex-1">
                      <option value="">Select Category</option>
                      {localCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <input
                      type="text"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      placeholder="Add new"
                      className="px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-24"
                    />
                    <button
                      type="button"
                      className="px-3 py-2 rounded-lg bg-[var(--color-accent)] text-white font-bold shadow hover:opacity-90 transition text-sm"
                      onClick={() => {
                        if (newCategory.trim() && !localCategories.includes(newCategory.trim())) {
                          setLocalCategories([...localCategories, newCategory.trim()]);
                          setNewCategory("");
                        }
                      }}
                    >+</button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
                  <select name="skillLevel" value={form.skillLevel || 'Intermediate'} onChange={onChange} className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-full">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                  <select name="availability" value={form.availability || ''} onChange={onChange} required className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-full">
                    <option value="">Select Availability</option>
                    {availabilities.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" name="date" value={form.date || ''} onChange={onChange} className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-full" />
                </div>
              </div>

              <input type="text" name="location" value={form.location || ''} onChange={onChange} required placeholder="Location (University/City)" className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-full" />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type & Pricing</label>
                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="isPaid" checked={form.isPaid || false} onChange={(e) => onChange({target: {name: 'isPaid', value: e.target.checked}})} /> Paid Offer
                  </label>
                  {form.isPaid && (
                    <input 
                      type="number" 
                      name="price" 
                      value={form.price || ''} 
                      onChange={onChange} 
                      placeholder="Price ($)" 
                      className="px-3 py-1 rounded border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-24"
                    />
                  )}
                </div>
              </div>

              <textarea name="description" value={form.description || ''} onChange={onChange} required placeholder="Brief description of what you're offering" className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none resize-none min-h-[100px] w-full" />
            </div>
          )}

          {/* Step 2: Detailed Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input type="text" name="duration" value={form.duration || ''} onChange={onChange} placeholder="e.g., 2 hours, 1 week" className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
                  <input type="number" name="maxStudents" value={form.maxStudents || 1} onChange={onChange} min="1" className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-full" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
                  <select name="sessionType" value={form.sessionType || 'One-time'} onChange={onChange} className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-full">
                    <option value="One-time">One-time</option>
                    <option value="Multiple sessions">Multiple sessions</option>
                    <option value="Ongoing support">Ongoing support</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Method</label>
                  <select name="deliveryMethod" value={form.deliveryMethod || 'Both'} onChange={onChange} className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-full">
                    <option value="In-person">In-person</option>
                    <option value="Online">Online</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prerequisites</label>
                <textarea name="prerequisites" value={form.prerequisites || ''} onChange={onChange} placeholder="What should the learner know beforehand?" className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none resize-none min-h-[80px] w-full" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">What You Will Learn</label>
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text" 
                    value={learningOutcome} 
                    onChange={(e) => setLearningOutcome(e.target.value)}
                    placeholder="Add learning outcome"
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearningOutcome())}
                  />
                  <button type="button" onClick={addLearningOutcome} className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white font-bold shadow hover:opacity-90 transition">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(form.whatYouWillLearn || []).map((outcome, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {outcome}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Contact Method</label>
                <select name="contactInfo.preferredContactMethod" value={form.contactInfo?.preferredContactMethod || 'Platform Message'} onChange={(e) => onChange({
                  target: {
                    name: 'contactInfo',
                    value: { ...form.contactInfo, preferredContactMethod: e.target.value }
                  }
                })} className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-full">
                  <option value="Platform Message">Platform Message</option>
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                </select>
              </div>

              {(form.contactInfo?.preferredContactMethod === 'Email' || form.contactInfo?.preferredContactMethod === 'Phone') && (
                <div className="grid grid-cols-2 gap-4">
                  {form.contactInfo?.preferredContactMethod === 'Email' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        value={form.contactInfo?.email || ''} 
                        onChange={(e) => onChange({
                          target: {
                            name: 'contactInfo',
                            value: { ...form.contactInfo, email: e.target.value }
                          }
                        })}
                        placeholder="your@email.com" 
                        className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-full" 
                      />
                    </div>
                  )}
                  
                  {form.contactInfo?.preferredContactMethod === 'Phone' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input 
                        type="tel" 
                        value={form.contactInfo?.phone || ''} 
                        onChange={(e) => onChange({
                          target: {
                            name: 'contactInfo',
                            value: { ...form.contactInfo, phone: e.target.value }
                          }
                        })}
                        placeholder="Your phone number" 
                        className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-full" 
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Review Your Offer</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Title:</strong> {form.title}</p>
                  <p><strong>Category:</strong> {form.category}</p>
                  <p><strong>Type:</strong> {form.isPaid ? 'Paid' : 'Free'} {form.isPaid && form.price && `($${form.price})`}</p>
                  <p><strong>Skill Level:</strong> {form.skillLevel}</p>
                  <p><strong>Delivery:</strong> {form.deliveryMethod}</p>
                  {(form.whatYouWillLearn || []).length > 0 && (
                    <p><strong>Learning Outcomes:</strong> {(form.whatYouWillLearn || []).length} items</p>
                  )}
                </div>
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
                Submit Offer
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostOfferModal;
