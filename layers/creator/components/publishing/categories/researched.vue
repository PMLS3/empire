<script setup lang="ts">
/*

Arts & Photography

Biographies & Memoirs

Business & Money

Children's Books

Computers & Technology

Cookbooks, Food & Wine

History

Health, Fitness & Dieting

Literature & Fiction

Mystery, Thriller & Suspense

Parenting & Relationships

Reference

Religion & Spirituality

Romance

Science Fiction & Fantasy

Sports & Outdoors

Travel

Teens

Deals in Books

Crafts, Hobbies & Home

Science & Math

Humor & Entertainment

Engineering & Transportation

Christian Books & Bibles

Lesbian, Gay, Bisexual & Transgender Books

LGBTQ+ Books

Law

Teen & Young Adult

Comics & Graphic Novels

Politics & Social Sciences

Self-Help

Education & Teaching

Test Preparation

Medical Books

Calendars

Books on CD

Textbooks

Nonfiction

Sports

Children's eBooks

Comics, Manga & Graphic Novels

Children's Nonfiction

Cooking, Food & Wine

LGBTQ+ eBooks

Medical eBooks

Science

Literary Criticism & Theory

Education & Reference

General

Classics

Foreign Languages

Libros en español

Arts & Entertainment

Home & Garden

Health & Wellness

Business & Careers

Children's Audiobooks

Education & Learning

Erotica

Relationships, Parenting & Personal Development

LGBTQ+

Money & Finance

Science & Engineering

Teen

Travel & Tourism

*/
const AmazonBookCategories = [
  {
    name: 'Arts & Photography',
    date: 'Oct 31, 2022',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'tabler:trekking',
  },
  {
    name: 'Biographies & Memoirs',
    date: 'Nov 14, 2022',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'map:rafting',
  },
  {
    name: 'Business & Money',
    date: 'Dec 3, 2022',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'map:climbing',
  },
  {
    name: "Children's Books",
    date: 'Dec 17, 2022',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'map:bicycle-store',
  },
  {
    name: 'Computers & Technology',
    date: 'Jan 2, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Cookbooks, Food & Wine',
    date: 'Jan 17, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'History',
    date: 'Feb 2, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Health, Fitness & Dieting',
    date: 'Feb 17, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Literature & Fiction',
    date: 'Mar 2, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Mystery, Thriller & Suspense',
    date: 'Mar 17, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Parenting & Relationships',
    date: 'Apr 2, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Reference',
    date: 'Apr 17, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Religion & Spirituality',
    date: 'May 2, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Romance',
    date: 'May 17, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Science Fiction & Fantasy',
    date: 'Jun 2, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Sports & Outdoors',
    date: 'Jun 17, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Travel',
    date: 'Jul 2, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Teens',
    date: 'Jul 17, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Deals in Books',
    date: 'Aug 2, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Crafts, Hobbies & Home',
    date: 'Aug 17, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Science & Math',
    date: 'Sep 2, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Humor & Entertainment',
    date: 'Sep 17, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Engineering & Transportation',
    date: 'Oct 2, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Christian Books & Bibles',
    date: 'Oct 17, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Lesbian, Gay, Bisexual & Transgender Books',
    date: 'Nov 2, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'LGBTQ+ Books',
    date: 'Nov 17, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Law',
    date: 'Dec 2, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Teen & Young Adult',
    date: 'Dec 17, 2023',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Comics & Graphic Novels',
    date: 'Jan 2, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Politics & Social Sciences',
    date: 'Jan 17, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Self-Help',
    date: 'Feb 2, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Education & Teaching',
    date: 'Feb 17, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Test Preparation',
    date: 'Mar 2, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Medical Books',
    date: 'Mar 17, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Calendars',
    date: 'Apr 2, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Books on CD',
    date: 'Apr 17, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Textbooks',
    date: 'May 2, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Nonfiction',
    date: 'May 17, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Sports',
    date: 'Jun 2, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: "Children's eBooks",
    date: 'Jun 17, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Comics, Manga & Graphic Novels',
    date: 'Jul 2, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: "Children's Nonfiction",
    date: 'Jul 17, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Cooking, Food & Wine',
    date: 'Aug 2, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'LGBTQ+ eBooks',
    date: 'Aug 17, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Medical eBooks',
    date: 'Sept 2, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Science',
    date: 'Sept 17, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Literary Criticism & Theory',
    date: 'Oct 2, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Education & Reference',
    date: 'Oct 17, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'General',
    date: 'Nov 2, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Classics',
    date: 'Nov 17, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Foreign Languages',
    date: 'Dec 2, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Libros en español',
    date: 'Dec 17, 2024',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Arts & Entertainment',
    date: 'Jan 2, 2025',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Home & Garden',
    date: 'Jan 17, 2025',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Health & Wellness',
    date: 'Feb 2, 2025',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Business & Careers',
    date: 'Feb 17, 2025',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: "Children's Audiobooks",
    date: 'Mar 2, 2025',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Education & Learning',
    date: 'Mar 17, 2025',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Erotica',
    date: 'Apr 2, 2025',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Relationships, Parenting & Personal Development',
    date: 'Apr 17, 2025',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'LGBTQ+',
    date: 'May 2, 2025',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Money & Finance',
    date: 'May 17, 2025',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Science & Engineering',
    date: 'Jun 2, 2025',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Teen',
    date: 'Jun 17, 2025',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
  {
    name: 'Travel & Tourism',
    date: 'Jul 20, 2025',
    image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
    icon: 'ic:twotone-category',
  },
]
</script>

<template>
  <BaseCard
    v-for="(item, i) in AmazonBookCategories"
    :key="i"
    shape="curved"
    class="flex items-center gap-3 p-3"
  >
    <div
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
      :class="getRandomColor()"
    >
      <Icon :name="item.icon" class="h-5 w-5" />
    </div>
    <div>
      <BaseHeading
        as="h4"
        size="sm"
        weight="medium"
        lead="tight"
        class="text-muted-800 dark:text-white"
      >
        <span>{{ item.name }}</span>
      </BaseHeading>
      <BaseParagraph size="xs">
        <span class="text-muted-400">
          {{ item.date }}
        </span>
      </BaseParagraph>
    </div>
    <div class="ms-auto flex items-center">
      <BaseButtonIcon shape="curved" muted class="scale-75">
        <Icon name="lucide:arrow-right" class="h-5 w-5" />
      </BaseButtonIcon>
    </div>
  </BaseCard>
</template>
