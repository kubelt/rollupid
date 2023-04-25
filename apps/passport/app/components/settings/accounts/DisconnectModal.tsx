import { useFetcher, Link } from '@remix-run/react'

import { useEffect } from 'react'

import { Text } from '@proofzero/design-system'
import { Loader } from '@proofzero/design-system/src/molecules/loader/Loader'
import { Button } from '@proofzero/design-system'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'

import type { FetcherWithComponents } from '@remix-run/react'

import warn from '~/assets/warning.svg'
import { AddressURN, AddressURNSpace } from '@proofzero/urns/address'

import { FiExternalLink } from 'react-icons/fi'

export type AddressUsageDisconnectModel = {
  message: string
  external: boolean
  path: string
}

export default ({
  fetcher,
  isOpen,
  setIsOpen,
  id,
  data,
  primaryAddressURN,
}: {
  fetcher: FetcherWithComponents<any>
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  id: string
  data: {
    title: string
    type: string
  }
  primaryAddressURN: AddressURN
}) => {
  const primaryAddressBaseURN = AddressURNSpace.getBaseURN(primaryAddressURN)
  const localFetcher = useFetcher()

  useEffect(() => {
    if (!isOpen || id === primaryAddressBaseURN) {
      return
    }

    localFetcher.submit(
      {
        addressURN: id,
      },
      {
        method: 'post',
        action: '/settings/accounts/usage',
      }
    )
  }, [id, primaryAddressBaseURN, isOpen])

  const canDisconnect =
    id !== primaryAddressBaseURN && localFetcher.data?.length === 0

  return localFetcher.state !== 'idle' ? (
    <Loader />
  ) : (
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <div
        className={`max-w-sm md:max-w-md lg:max-w-md w-[512px] relative transform rounded-lg bg-white text-left shadow-xl transition-all overflow-y-auto`}
      >
        <div className="flex flex-row space-x-4 p-6">
          <img src={warn} alt="Not Found" />

          <div className="flex-1">
            {canDisconnect && (
              <Text size="lg" weight="medium" className="text-gray-900">
                Disconnect account
              </Text>
            )}

            {!canDisconnect && (
              <>
                <Text size="lg" weight="medium" className="text-gray-900">
                  You can't disconnect this account
                </Text>

                <Text size="sm" weight="normal" className="text-gray-500 mt-2">
                  You can’t disconnect this account because:
                </Text>
              </>
            )}
          </div>
        </div>

        <div>
          {canDisconnect && (
            <Text size="sm" weight="normal" className="text-gray-500 px-6">
              Are you sure you want to disconnect {data.type} account
              {data.title && (
                <>
                  <span className="text-gray-800"> "{data.title}" </span>
                </>
              )}
              from Rollup? You might lose access to some functionality.
            </Text>
          )}

          {!canDisconnect && (
            <ul className="mb-6">
              {primaryAddressBaseURN === id && (
                <>
                  <div className="w-full border-b border-gray-200"></div>
                  <li className="py-3 px-6">
                    <Text size="sm" weight="normal" className="text-gray-500">
                      It looks like you are trying to disconnect your primary
                      account. You need to set another account as primary to be
                      able to disconnect this one.
                    </Text>
                  </li>
                </>
              )}

              {primaryAddressBaseURN !== id &&
                localFetcher.data?.length > 0 &&
                localFetcher.data.map((aum: AddressUsageDisconnectModel) => (
                  <>
                    <div className="w-full border-b border-gray-200"></div>
                    <li className="flex flex-row py-3 px-6">
                      <Text
                        size="sm"
                        weight="normal"
                        className="text-gray-500 flex-1"
                      >
                        {aum.message}
                      </Text>

                      {aum.external && (
                        <a
                          href={aum.path}
                          target="_blank"
                          onClick={() => setIsOpen(false)}
                        >
                          <Text
                            size="sm"
                            weight="medium"
                            className="text-indigo-500 flex flex-row items-center space-x-2"
                          >
                            <span>Edit</span>
                            <FiExternalLink className="text-indigo-500 w-4 h-4" />
                          </Text>
                        </a>
                      )}

                      {!aum.external && (
                        <Link to={aum.path} onClick={() => setIsOpen(false)}>
                          <Text
                            size="sm"
                            weight="medium"
                            className="text-indigo-500 pr-6"
                          >
                            <span>Edit</span>
                          </Text>
                        </Link>
                      )}
                    </li>
                  </>
                ))}
              <div className="w-full border-b border-gray-200"></div>
            </ul>
          )}

          {canDisconnect && (
            <fetcher.Form
              method="post"
              action="/settings/accounts/disconnect"
              className="p-6"
            >
              <input type="hidden" name="id" value={id} />

              <div className="flex justify-end items-center space-x-3 mt-7">
                <Button
                  btnType="secondary-alt"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  btnType="dangerous"
                  disabled={!canDisconnect}
                >
                  Disconnect
                </Button>
              </div>
            </fetcher.Form>
          )}
        </div>
      </div>
    </Modal>
  )
}