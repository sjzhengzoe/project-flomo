export type MediaType = string
export type MediaStatus = "planned" | "in_progress" | "completed"

export type MediaCategory = {
  id: string
  name: string
  sort_order: number
  created_at: string
  updated_at: string
}

export type MediaEntry = {
  id: string
  title: string
  media_type: MediaType
  watch_status: MediaStatus
  platforms: string[]
  cover_url: string
  is_revisitable: boolean
  season_count: number
  episode_count: number
  favorite_episode_count: number
  sort_order: number
  created_at: string
  updated_at: string
}

export type MediaEntryPage = {
  items: MediaEntry[]
  pagination: {
    page: number
    page_size: number
    total: number
    has_more: boolean
  }
}

export type MediaTimelineNoteType = "normal" | "key" | "quote"

export type MediaTimelineDialogue = {
  id: string
  speaker: string
  content: string
}

export type MediaTimelineNote = {
  id: string
  timecode: string
  content: string
  type?: MediaTimelineNoteType
  dialogues?: MediaTimelineDialogue[]
}

export type MediaEpisode = {
  id: string
  season_id: string
  episode_number: number
  title: string
  plot_summary: string
  timeline_notes: MediaTimelineNote[]
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export type MediaSeason = {
  id: string
  media_entry_id: string
  name: string
  sort_order: number
  cover_url: string
  episodes: MediaEpisode[]
  created_at: string
  updated_at: string
}

export type FavoriteMediaEpisode = {
  id: string
  season_id: string
  media_entry_id: string
  media_title: string
  media_type: MediaType
  platforms: string[]
  season_name: string
  episode_number: number
  episode_title: string
  plot_summary: string
  updated_at: string
}

export type ActivityType = "室内" | "户外" | "居家"

export type ActivityItem = {
  id: string
  name: string
  activity_type: ActivityType
  sort_order: number
  created_at: string
  updated_at: string
}

export type LuggageItem = {
  id: string
  group_id: string
  name: string
  sort_order: number
}

export type LuggageGroup = {
  id: string
  scene_id: string
  name: string
  is_required: boolean
  sort_order: number
  items: LuggageItem[]
}

export type LuggageScene = {
  id: string
  name: string
  sort_order: number
  groups: LuggageGroup[]
}

export type DiningMode = "takeout" | "dine_in"

export type DiningScene = {
  id: string
  name: string
  sort_order: number
  created_at: string
  updated_at: string
}

export type DiningPlace = {
  id: string
  name: string
  service_modes: DiningMode[]
  menu_items: string[]
  scene_id: string
  sort_order: number
  created_at: string
  updated_at: string
}
