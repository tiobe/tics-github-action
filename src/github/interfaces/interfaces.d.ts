type Side = 'LEFT' | 'RIGHT';
type AuthorAssociation = 'COLLABORATOR' | 'CONTRIBUTOR' | 'FIRST_TIMER' | 'FIRST_TIME_CONTRIBUTOR' | 'MANNEQUIN' | 'MEMBER' | 'NONE' | 'OWNER';

interface User {
  name?: string | null;
  email?: string | null;
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  starred_at?: string;
}

interface Reactions {
  url: string;
  total_count: number;
  '+1': number;
  '-1': number;
  laugh: number;
  confused: number;
  heart: number;
  hooray: number;
  eyes: number;
  rocket: number;
}

interface Link {
  href: string;
}

interface Links {
  self: Link;
  html: Link;
  pull_request: Link;
}

interface GitHubApp {
  id: number;
  slug?: string;
  node_id: string;
  owner: User | null;
  name: string;
  description?: string | null;
  external_url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  permissions: {
    issues?: string;
    checks?: string;
    metadata?: string;
    contents?: string;
    deployments?: string;
  };
  events: string[];
  installations_count?: number;
  client_id?: string;
  client_secret?: string;
  webhook_secret?: string | null;
  pem?: string;
}

export interface ReviewComment {
  url: string;
  pull_request_review_id: number | null;
  id: number;
  node_id: string;
  diff_hunk: string;
  path: string;
  position: number;
  original_position: number;
  commit_id: string;
  original_commit_id: string;
  in_reply_to_id?: number;
  user: User;
  body: string;
  created_at: string;
  updated_at: string;
  html_url: string;
  pull_request_url: string;
  author_association: AuthorAssociation;
  _links: Links;
  start_line?: number | null;
  original_start_line?: number | null;
  start_side?: Side | null;
  line?: number;
  original_line?: number;
  side?: Side;
  reactions?: Reactions;
  body_html?: string;
  body_text?: string;
}

export interface Comment {
  url: string;
  html_url: string;
  issue_url: string;
  id: number;
  node_id: string;
  user: User | null;
  created_at: string;
  updated_at: string;
  body?: string;
  body_text?: string;
  body_html?: string;
  reactions?: Reactions;
  performed_via_github_app?: GitHubApp | null;
}
