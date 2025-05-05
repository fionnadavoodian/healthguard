'use client';
import { useState } from 'react';

export default function UserInfoForm({ user, onSave }: { user: any; onSave: (updated: any) => void }) {
  const [formData, setFormData] = useState(user || {});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        onSave(updatedUser);
      }
    } catch (err) {
      console.error('Error updating user', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-3xl mx-auto mb-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Edit Profile</h2>

      {/* Personal Info Section */}
      <div className="mb-6">
        <h3 className="text-xl font-medium text-gray-700 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm text-gray-600">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="Enter your name"
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label htmlFor="age" className="block text-sm text-gray-600">Age</label>
            <input
              id="age"
              name="age"
              type="number"
              value={formData.age || ''}
              onChange={handleChange}
              placeholder="Enter your age"
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm text-gray-600">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="Enter your email"
              className="border p-2 rounded w-full"
            />
          </div>
        </div>
      </div>

      {/* Medical Info Section */}
      <div className="mb-6">
        <h3 className="text-xl font-medium text-gray-700 mb-4">Medical Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex-1 relative max-w-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur-3xl opacity-10" />
            <div className="relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl">
              <div className="grid grid-cols-2 gap-6">
                {['Heart Rate', 'Blood Pressure', 'Cholesterol', 'BMI'].map((metric) => (
                  <div key={metric} className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <h3 className="text-gray-500 dark:text-gray-300 text-sm font-medium">{metric}</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">--</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="bloodType" className="block text-sm text-gray-600">Blood Type</label>
            <input
              id="bloodType"
              name="bloodType"
              type="text"
              value={formData.bloodType || ''}
              onChange={handleChange}
              placeholder="Enter your blood type"
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label htmlFor="medicalConditions" className="block text-sm text-gray-600">Medical Conditions</label>
            <input
              id="medicalConditions"
              name="medicalConditions"
              type="text"
              value={formData.medicalConditions || ''}
              onChange={handleChange}
              placeholder="Enter known medical conditions"
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label htmlFor="medications" className="block text-sm text-gray-600">Medications</label>
            <input
              id="medications"
              name="medications"
              type="text"
              value={formData.medications || ''}
              onChange={handleChange}
              placeholder="Enter any medications"
              className="border p-2 rounded w-full"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
