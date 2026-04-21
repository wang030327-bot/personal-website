export type CollectionType = "notes" | "essays" | "friends";
export type WriterCollection = "notes" | "friends" | "essays";

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type BaseFrontmatter = {
  title: string;
  date: string;
  summary: string;
  tags: string[];
  genre?: string;
  cover?: string;
  images?: string[];
  draft?: boolean;
  featured?: boolean;
  visibility?: "public" | "friends";
  publishToWechat?: boolean;
  slug?: string;
};

export type ContentEntry = BaseFrontmatter & {
  slug: string;
  type: CollectionType;
  content: string;
  toc: TocItem[];
  readingTime: string;
};

export type MusicEntry = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  recommendation: string;
  date: string;
  neteaseUrl: string;
  isToday?: boolean;
  featured?: boolean;
};

export type MusicInput = {
  neteaseUrl: string;
  id?: string;
  title?: string;
  artist?: string;
  cover?: string;
  recommendation?: string;
  date?: string;
  isToday?: boolean;
  featured?: boolean;
};

export type WriterEditableEntry = {
  collection: WriterCollection;
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  genre: string;
  cover?: string;
  content: string;
  publishToWechat: boolean;
};
