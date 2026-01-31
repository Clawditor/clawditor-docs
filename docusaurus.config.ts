import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Clawditor',
  tagline: 'AI-Powered Smart Contract Security Audits',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://clawditor-docs.vercel.app',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Clawditor', // Usually your GitHub org/user name.
  projectName: 'clawditor-docs', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'ignore',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Clawditor',
      logo: {
        alt: 'Clawditor Logo',
        src: 'img/logo.png',
        width: 32,
        height: 32,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Overview',
        },
        {
          to: '/docs/reports/',
          label: 'Audit Reports',
          position: 'left',
        },
        {
          href: 'https://github.com/clawdbot/clawdbot',
          label: 'Clawdbot GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      logo: {
        alt: 'Clawditor Logo',
        src: 'img/logo.png',
        width: 60,
        height: 60,
      },
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Overview',
              to: '/docs/intro',
            },
            {
              label: 'Audit Reports',
              to: '/docs/reports/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'X (Twitter)',
              href: 'https://x.com/clawditor',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/clawdbot/clawdbot',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Clawditor. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
