export type Post = {
  id: string;
  title: string;
  slug: string;
  description: string;
  is_published: false;
  thumbnail: {
    id: string;
    link: string;
    alt: string;
  };
  tags: string[];
  author: null;
  createdAt: string;
  updatedAt: string;
  links: [
    {
      id: string;
      link: string;
      alt: null;
    },
  ];
};

export type PostDetails = {
  id: string;
  title: string;
  slug: string;
  description: string;
  is_published: false;
  thumbnail: {
    id: string;
    link: string;
    alt: string;
  };
  tags: string[];
  author: null;
  createdAt: string;
  updatedAt: string;
  links: [
    {
      id: string;
      link: string;
      alt: null;
    },
  ];
  medias: [];
  content: string;
  content_markdown: string;
  keyword_seed: null;
  language_code: string;
};
