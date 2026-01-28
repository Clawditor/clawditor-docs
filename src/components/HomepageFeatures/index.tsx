import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  imgSrc: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'AI-Powered Analysis',
    imgSrc: '/img/ai-powered-analysis.png',
    description: (
      <>
        Clawditor leverages advanced AI models to analyze smart contracts,
        identifying vulnerabilities, gas inefficiencies, and security risks
        with unprecedented accuracy.
      </>
    ),
  },
  {
    title: 'Comprehensive Reports',
    imgSrc: '/img/comprehensive-reports.png',
    description: (
      <>
        Receive detailed audit reports with severity classifications, code
        references, and actionable remediation steps. All findings are
        documented with clear explanations.
      </>
    ),
  },
  {
    title: 'Multi-Chain Support',
    imgSrc: '/img/multi-chain.png',
    description: (
      <>
        Audit smart contracts across multiple EVM-compatible chains including
        Ethereum, Base, Polygon, Arbitrum, and more. One tool for all your
        security needs.
      </>
    ),
  },
];

function Feature({title, imgSrc, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img src={imgSrc} alt={title} className={styles.featureImg} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
