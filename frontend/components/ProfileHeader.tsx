/**
 * Profile Header Component
 * Displays camper name and profile picture at the top of application sections
 */

'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ProfileHeaderProps {
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  sex?: string;
  dateOfBirth?: string;
}

export default function ProfileHeader({ firstName, lastName, profilePictureUrl, sex, dateOfBirth }: ProfileHeaderProps) {
  // Don't render if no name data
  if (!firstName && !lastName) {
    return null;
  }

  // Get initials for fallback
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();

  // Calculate age from date of birth
  const calculateAge = (dob: string): number | null => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = dateOfBirth ? calculateAge(dateOfBirth) : null;

  // Build the info string (sex and age)
  const infoItems = [];
  if (sex) infoItems.push(sex);
  if (age !== null) infoItems.push(`${age} years old`);
  const infoString = infoItems.length > 0 ? infoItems.join(' • ') : 'Camper Application';

  return (
    <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-camp-green/10 to-camp-orange/10 rounded-lg border border-camp-green/20">
      <Avatar className="h-12 w-12 border-2 border-camp-green">
        {profilePictureUrl ? (
          <AvatarImage src={profilePictureUrl} alt={`${firstName} ${lastName}`} />
        ) : null}
        <AvatarFallback className="bg-camp-green text-white font-semibold">
          {initials || '?'}
        </AvatarFallback>
      </Avatar>
      <div>
        <h2 className="text-lg font-semibold text-camp-charcoal">
          {firstName} {lastName}
        </h2>
        <p className="text-sm text-gray-600">{infoString}</p>
      </div>
    </div>
  );
}
