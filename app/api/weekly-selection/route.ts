import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import WeeklySelection from '@/lib/models/WeeklySelection';
import Member from '@/lib/models/Member';
import Family from '@/lib/models/Family';

export const dynamic = 'force-dynamic';

// Helper function to get week start (Monday) and end (Sunday) dates
function getWeekDates(date: Date = new Date()): { start: Date; end: Date; year: number; weekNumber: number } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Get ISO week number
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);

  return {
    start: monday,
    end: sunday,
    year: date.getFullYear(),
    weekNumber,
  };
}

async function handler(req: NextRequest, { user }: { user: any }) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const { searchParams } = new URL(req.url);
      const weekParam = searchParams.get('week'); // Optional: 'current' or specific date

      const weekDates = getWeekDates(weekParam ? new Date(weekParam) : new Date());

      // Check if there's already a selection for this week
      let selection = await WeeklySelection.findOne({
        year: weekDates.year,
        weekNumber: weekDates.weekNumber,
      })
        .populate('memberId')
        .populate('familyId');

      // If no selection exists, create a new random one
      if (!selection) {
        // Get all previously selected IDs to avoid repetition
        const previousSelections = await WeeklySelection.find({})
          .select('memberId familyId selectionType')
          .lean();

        const selectedMemberIds = new Set(
          previousSelections
            .filter((s) => s.memberId && s.selectionType === 'member')
            .map((s) => s.memberId?.toString())
            .filter(Boolean)
        );

        const selectedFamilyIds = new Set(
          previousSelections
            .filter((s) => s.familyId && s.selectionType === 'family')
            .map((s) => s.familyId?.toString())
            .filter(Boolean)
        );

        // Get all active members and families
        const allMembers = await Member.find({ 
          membershipStatus: { $in: ['Active', 'Visitor'] },
          lifeStatus: 'Alive'
        }).select('_id').lean();

        const allFamilies = await Family.find({}).select('_id').lean();

        // Filter out previously selected
        const availableMembers = allMembers.filter(
          (m) => !selectedMemberIds.has(m._id.toString())
        );
        const availableFamilies = allFamilies.filter(
          (f) => !selectedFamilyIds.has(f._id.toString())
        );

        // Decide whether to select a member or family (50/50 chance, or prefer families if available)
        let selectionType: 'member' | 'family' = 'member';
        let selectedMemberId: any = null;
        let selectedFamilyId: any = null;

        // If no available families or members, reset and use all
        if (availableFamilies.length === 0 && availableMembers.length === 0) {
          // Reset - use all members and families
          selectedMemberId = allMembers.length > 0 
            ? allMembers[Math.floor(Math.random() * allMembers.length)]._id 
            : null;
          selectedFamilyId = allFamilies.length > 0 
            ? allFamilies[Math.floor(Math.random() * allFamilies.length)]._id 
            : null;
          
          if (selectedFamilyId && selectedMemberId) {
            selectionType = Math.random() > 0.5 ? 'family' : 'member';
          } else if (selectedFamilyId) {
            selectionType = 'family';
          } else if (selectedMemberId) {
            selectionType = 'member';
          }
        } else {
          // Prefer families if available, otherwise use members
          if (availableFamilies.length > 0 && (availableMembers.length === 0 || Math.random() > 0.4)) {
            selectionType = 'family';
            selectedFamilyId = availableFamilies[Math.floor(Math.random() * availableFamilies.length)]._id;
          } else if (availableMembers.length > 0) {
            selectionType = 'member';
            selectedMemberId = availableMembers[Math.floor(Math.random() * availableMembers.length)]._id;
          }
        }

        if (!selectedMemberId && !selectedFamilyId) {
          return NextResponse.json(
            { error: 'No members or families available for selection' },
            { status: 400 }
          );
        }

        // Create new selection
        selection = await WeeklySelection.create({
          selectionType,
          memberId: selectedMemberId,
          familyId: selectedFamilyId,
          weekStartDate: weekDates.start,
          weekEndDate: weekDates.end,
          year: weekDates.year,
          weekNumber: weekDates.weekNumber,
          prayerSent: false,
          prayerSentCount: 0,
        });

        // Populate the selection
        const populatedSelection = await WeeklySelection.findById(selection._id)
          .populate('memberId')
          .populate('familyId')
          .lean();
        
        if (populatedSelection) {
          selection = populatedSelection as any;
        }
      }

      return NextResponse.json({ selection });
    } catch (error: any) {
      console.error('Error fetching weekly selection:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch weekly selection' },
        { status: 500 }
      );
    }
  }

  if (req.method === 'POST') {
    try {
      const { action, selectionId } = await req.json();

      if (action === 'markPrayerSent') {
        const selection = await WeeklySelection.findByIdAndUpdate(
          selectionId,
          { prayerSent: true },
          { new: true }
        )
          .populate('memberId')
          .populate('familyId');

        if (!selection) {
          return NextResponse.json(
            { error: 'Selection not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({ selection });
      }
    } catch (error: any) {
      console.error('Error updating weekly selection:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update selection' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = requireAuth(handler);
export const POST = requireAuth(handler);

