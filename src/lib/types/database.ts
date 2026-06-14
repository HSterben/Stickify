export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type BoardVisibility = "private" | "public";

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          slug: string;
          icon: string | null;
          position: number;
          visibility: BoardVisibility;
          share_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          slug: string;
          icon?: string | null;
          position?: number;
          visibility?: BoardVisibility;
          share_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          slug?: string;
          icon?: string | null;
          position?: number;
          visibility?: BoardVisibility;
          share_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          type: "text" | "code" | "link";
          title: string;
          content_text: string | null;
          content_code: string | null;
          code_language: string | null;
          url: string | null;
          preview_title: string | null;
          preview_description: string | null;
          preview_image: string | null;
          preview_favicon: string | null;
          preview_domain: string | null;
          color: string | null;
          is_pinned: boolean;
          is_archived: boolean;
          position: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          type: "text" | "code" | "link";
          title: string;
          content_text?: string | null;
          content_code?: string | null;
          code_language?: string | null;
          url?: string | null;
          preview_title?: string | null;
          preview_description?: string | null;
          preview_image?: string | null;
          preview_favicon?: string | null;
          preview_domain?: string | null;
          color?: string | null;
          is_pinned?: boolean;
          is_archived?: boolean;
          position?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          type?: "text" | "code" | "link";
          title?: string;
          content_text?: string | null;
          content_code?: string | null;
          code_language?: string | null;
          url?: string | null;
          preview_title?: string | null;
          preview_description?: string | null;
          preview_image?: string | null;
          preview_favicon?: string | null;
          preview_domain?: string | null;
          color?: string | null;
          is_pinned?: boolean;
          is_archived?: boolean;
          position?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
      };
      post_tags: {
        Row: {
          post_id: string;
          tag_id: string;
        };
        Insert: {
          post_id: string;
          tag_id: string;
        };
        Update: {
          post_id?: string;
          tag_id?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      post_type: "text" | "code" | "link";
    };
  };
}

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Tag = Database["public"]["Tables"]["tags"]["Row"];
export type PostTag = Database["public"]["Tables"]["post_tags"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type TagPartial = {
  id: string;
  name: string;
};

export type PostWithTags = Post & {
  tags: TagPartial[];
};

export type PostWithTagsAndBoard = PostWithTags & {
  category_name: string;
  category_slug: string;
};
