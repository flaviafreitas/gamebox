import { supabase } from '@/lib/supabase';
import type { LogWithGame } from '@/lib/profile';

export interface FeedItem extends LogWithGame {
  profiles: { username: string; display_name: string | null } | null;
}

/** Registros das pessoas que o usuário segue, mais recentes primeiro. */
export async function getFeed(userId: string, limit = 50): Promise<FeedItem[]> {
  const { data: follows, error: followsErr } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);
  if (followsErr) throw followsErr;

  const ids = (follows ?? []).map((f) => f.following_id as string);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from('logs')
    .select('*, games(*), profiles(username, display_name)')
    .in('user_id', ids)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as unknown as FeedItem[]) ?? [];
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function follow(followerId: string, followingId: string): Promise<void> {
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, following_id: followingId });
  if (error) throw error;
}

export async function unfollow(followerId: string, followingId: string): Promise<void> {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);
  if (error) throw error;
}

export async function getFollowCounts(
  userId: string,
): Promise<{ followers: number; following: number }> {
  const [followers, following] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
  ]);
  return { followers: followers.count ?? 0, following: following.count ?? 0 };
}
