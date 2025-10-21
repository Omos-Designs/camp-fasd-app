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
}

export default function ProfileHeader({ firstName, lastName, profilePictureUrl }: ProfileHeaderProps) {
  // Don't render if no name data
  if (!firstName && !lastName) {
    return null;
  }

  // Get initials for fallback
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();

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
        <p className="text-sm text-gray-600">Camper Application</p>
      </div>
    </div>
  );
}
