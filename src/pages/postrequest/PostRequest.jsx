import React from 'react'

const categories = ["Coding", "Presentation", "Design", "Tutoring"];
const urgencies = ["Today", "This Week", "Flexible"];

const PostRequest = () => {
  return (
    <div className="min-h-screen bg-[var(--color-primary)] flex flex-col items-center py-12 px-4">
      <form className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-4">Post a Help Request</h2>
        <div>
          <label className="block text-sm font-semibold mb-2 text-[var(--color-primary)]">Help Needed</label>
          <input type="text" className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" placeholder="e.g. Need PPT design for seminar" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-[var(--color-primary)]">Category</label>
          <select className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" required>
            <option value="">Select Category</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-[var(--color-primary)]">Deadline/Urgency</label>
          <select className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" required>
            <option value="">Select Urgency</option>
            {urgencies.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-[var(--color-primary)]">Location</label>
          <input type="text" className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" placeholder="University / City" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-[var(--color-primary)]">Free or Paid</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <input type="radio" name="freePaid" value="Free" className="accent-teal-400" required /> Free
            </label>
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <input type="radio" name="freePaid" value="Paid" className="accent-teal-400" required /> Paid
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-[var(--color-primary)]">Description</label>
          <textarea className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" rows={4} placeholder="Describe your request in detail..." required />
        </div>
        <button type="submit" className="w-full py-3 rounded-lg font-bold bg-[var(--color-accent)] text-[var(--color-surface)] shadow-lg hover:opacity-90 transition">Submit Request</button>
      </form>
    </div>
  );
}

export default PostRequest
