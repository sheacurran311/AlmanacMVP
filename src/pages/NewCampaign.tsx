import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const NewCampaign: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pointsReward, setPointsReward] = useState('');
  const [active, setActive] = useState(true);
  const navigate = useNavigate();
  const { tenantId } = useParams<{ tenantId: string }>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          name,
          description,
          start_date: startDate,
          end_date: endDate,
          points_reward: parseInt(pointsReward),
          active,
          tenant_id: tenantId
        })
        .single();

      if (error) throw error;
      navigate(`/dashboard/${tenantId}/campaigns/${data.id}`);
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Create New Campaign</h1>
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-bold mb-2">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            rows={4}
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="startDate" className="block text-gray-700 font-bold mb-2">Start Date</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="endDate" className="block text-gray-700 font-bold mb-2">End Date</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="pointsReward" className="block text-gray-700 font-bold mb-2">Points Reward</label>
          <input
            type="number"
            id="pointsReward"
            value={pointsReward}
            onChange={(e) => setPointsReward(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="mr-2"
            />
            Active
          </label>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          Create Campaign
        </button>
      </form>
    </div>
  );
};

export default NewCampaign;