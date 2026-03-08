export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  theme: string;
  bg_color: string;
  button_style: string;
  font: string;
  created_at: string;
}

export interface UserLink {
  id: string;
  user_id: string;
  title: string;
  url: string;
  platform: string;
  is_active: boolean;
  position: number;
  created_at: string;
}

export interface AnalyticsView {
  id: string;
  user_id: string;
  visited_at: string;
}

export interface AnalyticsClick {
  id: string;
  link_id: string;
  user_id: string;
  clicked_at: string;
}
