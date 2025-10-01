export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          access_level: string | null
          admin_id: string | null
          created_at: string
          id: string
          role_title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_level?: string | null
          admin_id?: string | null
          created_at?: string
          id?: string
          role_title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_level?: string | null
          admin_id?: string | null
          created_at?: string
          id?: string
          role_title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          department: string | null
          expires_at: string | null
          id: string
          priority: string | null
          target_role: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          department?: string | null
          expires_at?: string | null
          id?: string
          priority?: string | null
          target_role: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          department?: string | null
          expires_at?: string | null
          id?: string
          priority?: string | null
          target_role?: string
          title?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          created_at: string
          date: string
          faculty_id: string
          id: string
          period: number
          remarks: string | null
          status: string
          student_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          faculty_id: string
          id?: string
          period: number
          remarks?: string | null
          status: string
          student_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          faculty_id?: string
          id?: string
          period?: number
          remarks?: string | null
          status?: string
          student_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      department_news: {
        Row: {
          created_at: string
          department_id: string
          description: string
          id: string
          published_date: string
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          department_id: string
          description: string
          id?: string
          published_date?: string
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          department_id?: string
          description?: string
          id?: string
          published_date?: string
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      faculty_profiles: {
        Row: {
          courses_managed: string[] | null
          created_at: string
          department: string | null
          designation: string | null
          faculty_id: string | null
          id: string
          office_hours: string | null
          research_publications: string[] | null
          subjects_taught: string[] | null
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          courses_managed?: string[] | null
          created_at?: string
          department?: string | null
          designation?: string | null
          faculty_id?: string | null
          id?: string
          office_hours?: string | null
          research_publications?: string[] | null
          subjects_taught?: string[] | null
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          courses_managed?: string[] | null
          created_at?: string
          department?: string | null
          designation?: string | null
          faculty_id?: string | null
          id?: string
          office_hours?: string | null
          research_publications?: string[] | null
          subjects_taught?: string[] | null
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      fees: {
        Row: {
          academic_year: string | null
          amount: number
          created_at: string | null
          due_date: string
          fee_type: string
          id: string
          paid_date: string | null
          remarks: string | null
          semester: string | null
          status: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year?: string | null
          amount: number
          created_at?: string | null
          due_date: string
          fee_type: string
          id?: string
          paid_date?: string | null
          remarks?: string | null
          semester?: string | null
          status?: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string | null
          amount?: number
          created_at?: string | null
          due_date?: string
          fee_type?: string
          id?: string
          paid_date?: string | null
          remarks?: string | null
          semester?: string | null
          status?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      leave_requests: {
        Row: {
          approved_by: string | null
          created_at: string | null
          end_date: string
          id: string
          reason: string
          remarks: string | null
          start_date: string
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          reason: string
          remarks?: string | null
          start_date: string
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          reason?: string
          remarks?: string | null
          start_date?: string
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      parent_profiles: {
        Row: {
          created_at: string | null
          emergency_contact: string | null
          id: string
          occupation: string | null
          parent_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emergency_contact?: string | null
          id?: string
          occupation?: string | null
          parent_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          emergency_contact?: string | null
          id?: string
          occupation?: string | null
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          date_of_birth: string | null
          department: string | null
          email: string
          full_name: string
          id: string
          organization_id: string | null
          phone: string | null
          profile_photo_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          email: string
          full_name: string
          id?: string
          organization_id?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          organization_id?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          department_id: string
          id: string
          options: Json
          question: string
          updated_at: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          department_id: string
          id?: string
          options: Json
          question: string
          updated_at?: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          department_id?: string
          id?: string
          options?: Json
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_parent_mapping: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          parent_id: string
          relationship: string
          student_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          parent_id: string
          relationship: string
          student_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          parent_id?: string
          relationship?: string
          student_id?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          achievements: string[] | null
          attendance_percentage: number | null
          cgpa: number | null
          courses_enrolled: string[] | null
          created_at: string
          department: string | null
          id: string
          roll_number: string | null
          skills_interests: string[] | null
          student_id: string | null
          updated_at: string
          user_id: string
          year_of_study: number | null
          year_semester: string | null
        }
        Insert: {
          achievements?: string[] | null
          attendance_percentage?: number | null
          cgpa?: number | null
          courses_enrolled?: string[] | null
          created_at?: string
          department?: string | null
          id?: string
          roll_number?: string | null
          skills_interests?: string[] | null
          student_id?: string | null
          updated_at?: string
          user_id: string
          year_of_study?: number | null
          year_semester?: string | null
        }
        Update: {
          achievements?: string[] | null
          attendance_percentage?: number | null
          cgpa?: number | null
          courses_enrolled?: string[] | null
          created_at?: string
          department?: string | null
          id?: string
          roll_number?: string | null
          skills_interests?: string[] | null
          student_id?: string | null
          updated_at?: string
          user_id?: string
          year_of_study?: number | null
          year_semester?: string | null
        }
        Relationships: []
      }
      student_quiz_responses: {
        Row: {
          created_at: string
          id: string
          points_earned: number
          questions_answered: Json
          quiz_date: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_earned?: number
          questions_answered: Json
          quiz_date?: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points_earned?: number
          questions_answered?: Json
          quiz_date?: string
          student_id?: string
        }
        Relationships: []
      }
      support_profiles: {
        Row: {
          access_level: string | null
          created_at: string | null
          id: string
          specialization: string | null
          support_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_level?: string | null
          created_at?: string | null
          id?: string
          specialization?: string | null
          support_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_level?: string | null
          created_at?: string | null
          id?: string
          specialization?: string | null
          support_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_quiz_questions_for_student: {
        Args: { dept_id: string; question_limit?: number }
        Returns: {
          department_id: string
          id: string
          options: Json
          question: string
        }[]
      }
      validate_quiz_answers: {
        Args: { question_ids: string[]; user_answers: string[] }
        Returns: {
          correct_answer: string
          is_correct: boolean
          question_id: string
        }[]
      }
    }
    Enums: {
      user_role: "Faculty" | "Student" | "Admin" | "Parent" | "Support"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["Faculty", "Student", "Admin", "Parent", "Support"],
    },
  },
} as const
