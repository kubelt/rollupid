import SectionTitle from '~/components/typography/SectionTitle'
import SectionHeading from '~/components/typography/SectionHeading'
import SmallRegularBlock from '~/components/typography/SmallRegularBlock'

import styles from './FAQ.css'

export const links = () => [{ rel: 'stylesheet', href: styles }]

const contents = [
  {
    question: 'How do I use 3ID?',
    answer: (
      <>
        <SmallRegularBlock className="mb-4">
          Now that you've claimed your 3ID, other applications can query your
          profile to fetch your public profile details including your avatar.
          Soon you will also be able to promote your profile and NFTs on social
          media.
        </SmallRegularBlock>

        <SmallRegularBlock className="mb-4">
          In our roadmap we have many more features coming including linking
          multiple accounts together, messaging, storage and more.
        </SmallRegularBlock>
      </>
    ),
  },
  {
    question: 'Can I sell my invite card?',
    answer: (
      <div className="mb-4">
        <SmallRegularBlock type="span">
          Yes. You can list your invite card on
        </SmallRegularBlock>

        <a
          target={'_blank'}
          rel={'noopener noopener noreferrer'}
          href={`https://opensea.io/collection/3id-invite`}
          className="mx-1"
        >
          OpenSea
        </a>

        <SmallRegularBlock type="span">
          or transfer it to a friend.
        </SmallRegularBlock>
      </div>
    ),
  },
  {
    question: 'What is my 3ID PFP?',
    answer: (
      <div className="mb-4">
        <SmallRegularBlock>
          Your 3ID gradient PFP is a soulbound avatar made up of 4 color traits
          -- one version color and three common, uncommon, rare and epic colors
          traits. Rarity is decided by several factors:
        </SmallRegularBlock>

        <ol
          style={{
            listStyle: 'auto',
            marginTop: '1rem',
            marginBottom: '1rem',
            marginLeft: '1.25rem',
          }}
        >
          <li>
            <SmallRegularBlock type="span">
              The first color trait probability is based on which popular NFTs
              you currently hold.
            </SmallRegularBlock>
          </li>

          <li>
            <SmallRegularBlock type="span">
              The second color trait is based on which of our developer
              collections you hold.
            </SmallRegularBlock>
          </li>

          <li>
            <SmallRegularBlock type="span">
              The last color trait is based on your ETH balance.
            </SmallRegularBlock>
          </li>
        </ol>

        <div>
          <SmallRegularBlock type="span">Click</SmallRegularBlock>

          <a
            target={'_blank'}
            rel={'noopener noopener noreferrer'}
            href={`https://github.com/kubelt/kubelt/tree/main/nftar`}
            className="mx-1"
          >
            here
          </a>

          <SmallRegularBlock type="span">
            to read the code. Once generated, your 3ID gradient PFP is soul
            bound to your identity. More generations of this PFP will be
            released corresponding with every major version of 3ID.
          </SmallRegularBlock>
        </div>
      </div>
    ),
  },
  {
    question: 'Who is behind this project?',
    answer: (
      <div className="mb-4">
        <SmallRegularBlock type="span">3ID is created by</SmallRegularBlock>
        <a
          target={'_blank'}
          rel={'noopener noopener noreferrer'}
          href={`https://kubelt.com`}
          className="mx-1"
        >
          Kubelt
        </a>

        <SmallRegularBlock type="span">
          , a decentralized application platform, and is inspired by Web3 and
          the digital identity specification. Instead of applications
          centralizing user data, 3ID users like yourself will be able to
          permission/revoke applications to access personal data, messages and
          more.
        </SmallRegularBlock>

        <SmallRegularBlock className="mt-4">
          Our goal is to eliminate email as a basis of online identity and shift
          the norm towards being cryptographic, user-centric and decentralized
          platforms.
        </SmallRegularBlock>
      </div>
    ),
  },
]

const FAQ = () => {
  return (
    <div className="mb-3">
      <SectionTitle className="mb-1 mt-6" title="FAQ" />
      <div className="accordion" id="accordionFaq">
        {contents.map((content, index) => {
          const borderStyle = index === contents.length - 1 ? '' : 'border-down'

          return (
            <div
              key={content.question}
              className={`accordion-item bg-white ${borderStyle}`}
            >
              <div
                className="accordion-header border-none mb-0"
                id={`heading-${index}`}
              >
                <button
                  className={
                    index === 0
                      ? 'accordion-button relative flex\
                       items-center w-full py-4\
                      text-left bg-white border-0 rounded-none\
                       transition focus:outline-none'
                      : 'accordion-button collapsed relative flex\
                       items-center w-full py-4\
                        text-left bg-white border-none rounded-none\
                         transition focus:outline-none'
                  }
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse-${index}`}
                  aria-expanded="true"
                  aria-controls={`collapse-${index}`}
                >
                  <SectionHeading>{content.question}</SectionHeading>
                </button>
              </div>
              <div
                id={`collapse-${index}`}
                className={
                  index === 0
                    ? 'accordion-collapse collapse show'
                    : 'accordion-collapse collapse'
                }
                aria-labelledby={`heading-${index}`}
                data-bs-parent="#accordionFaq"
              >
                <div className="accordion-body">{content.answer}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FAQ
