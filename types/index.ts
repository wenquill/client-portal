import type { Database } from "./database.types";

export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type UserProfile = Database["public"]["Tables"]["users"]["Row"];
export type Ticket = Database["public"]["Tables"]["tickets"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];

export type InsertTicket = Database["public"]["Tables"]["tickets"]["Insert"];
export type InsertComment = Database["public"]["Tables"]["comments"]["Insert"];

export type UserRole = Database["public"]["Enums"]["user_role"];
export type TicketStatus = Database["public"]["Enums"]["ticket_status"];
export type TicketPriority = Database["public"]["Enums"]["ticket_priority"];

export type TicketWithRelations = Ticket & {
  assignee: Pick<UserProfile, "id" | "full_name" | "avatar_url"> | null;
  created_by_user: Pick<UserProfile, "id" | "full_name" | "avatar_url"> | null;
};

export type CommentWithAuthor = Comment & {
  author: Pick<UserProfile, "id" | "full_name" | "avatar_url">;
};

export type AuthUser = {
  id: string;
  email: string | undefined;
  profile: UserProfile;
  organization: Organization;
  availableOrganizations: Organization[];
};
