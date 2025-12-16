import React, { useState } from 'react';
import { Member, Translation } from '../types';
import { UserPlus, User, Trash2 } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

interface MembersProps {
  members: Member[];
  onAddMember: (member: Omit<Member, 'id'>) => void;
  onDeleteMember: (id: string) => void;
  t: Translation;
}

export const Members: React.FC<MembersProps> = ({ members, onAddMember, onDeleteMember, t }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [roomNo, setRoomNo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMember({
      name,
      roomNo,
      joinedDate: new Date().toISOString().split('T')[0]
    });
    setName('');
    setRoomNo('');
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (memberToDelete) {
      onDeleteMember(memberToDelete);
      setMemberToDelete(null);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">{t.messMembers}</h2>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <UserPlus className="h-4 w-4 mr-1" />
          {t.add}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {members.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-slate-200 border-dashed text-slate-400">
            {t.noMembersAdded}
          </div>
        ) : (
          members.map(member => (
            <div key={member.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-2 rounded-full text-indigo-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{member.name}</h3>
                  <p className="text-xs text-slate-500">{t.room} {member.roomNo} • {t.joined} {member.joinedDate}</p>
                </div>
              </div>
              <button 
                onClick={() => setMemberToDelete(member.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Member Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t.addNewMember}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.fullName}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={t.namePlaceholder}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.roomNumber}</label>
            <input
              type="text"
              required
              value={roomNo}
              onChange={(e) => setRoomNo(e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={t.roomPlaceholder}
            />
          </div>
          <Button type="submit" className="w-full">{t.addMemberBtn}</Button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!memberToDelete} onClose={() => setMemberToDelete(null)} title={t.deleteTitle || "Delete Member"}>
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">{t.deleteConfirm}</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setMemberToDelete(null)}>
              {t.cancel}
            </Button>
            <Button variant="danger" className="flex-1" onClick={confirmDelete}>
              {t.deleteBtn || "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};