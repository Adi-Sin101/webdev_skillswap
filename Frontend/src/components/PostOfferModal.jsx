import React from "react";

const PostOfferModal = ({ open, onClose, onSubmit, form, onChange, categories, availabilities }) => {
  const [newCategory, setNewCategory] = React.useState("");
  const [localCategories, setLocalCategories] = React.useState(categories);
  React.useEffect(() => { setLocalCategories(categories); }, [categories]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-transparent">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6">Post an Offer</h2>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <input type="text" name="title" value={form.title} onChange={onChange} required placeholder="Skill/Service Title" className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none" />
          <div className="flex gap-2">
            <select name="category" value={form.category} onChange={onChange} required className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none">
              <option value="">Select Category</option>
              {localCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input
              type="text"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder="Add category"
              className="px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none w-32"
            />
            <button
              type="button"
              className="px-3 py-2 rounded-lg bg-[var(--color-accent)] text-[var(--color-surface)] font-bold shadow hover:opacity-90 transition"
              onClick={() => {
                if (newCategory.trim() && !localCategories.includes(newCategory.trim())) {
                  setLocalCategories([...localCategories, newCategory.trim()]);
                  setNewCategory("");
                }
              }}
            >Add</button>
          </div>
          <div className="flex gap-2">
            <select name="availability" value={form.availability} onChange={onChange} required className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none">
              <option value="">Availability</option>
              {availabilities.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <input type="date" name="date" value={form.date} onChange={onChange} className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none" />
          </div>
          <input type="text" name="location" value={form.location} onChange={onChange} required placeholder="Location (University/City)" className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none" />
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2">
              <input type="radio" name="type" value="Free" checked={form.type === 'Free'} onChange={onChange} /> Free
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="type" value="Paid" checked={form.type === 'Paid'} onChange={onChange} /> Paid
            </label>
          </div>
          <textarea name="description" value={form.description} onChange={onChange} required placeholder="Description" className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none resize-none min-h-[80px]" />
          <button type="submit" className="w-full py-2 rounded-lg font-bold bg-[var(--color-accent)] text-[var(--color-surface)] shadow-lg hover:opacity-90 transition">Submit Offer</button>
        </form>
      </div>
    </div>
  );
};

export default PostOfferModal;
