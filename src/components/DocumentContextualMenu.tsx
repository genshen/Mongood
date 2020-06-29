import React, { useCallback, useState } from 'react'
import {
  ContextualMenu,
  DialogType,
  getTheme,
  Dialog,
  DialogFooter,
  DefaultButton,
} from '@fluentui/react'
import csv, { Options } from 'csv-stringify'
import { useSelector, useDispatch } from 'react-redux'

import { stringify, MongoData } from '@/utils/mongo-shell-data'
import { runCommand } from '@/utils/fetcher'
import { actions } from '@/stores'

const cast: Options['cast'] = {
  boolean: (value) => stringify(value),
  date: (value) => stringify(value),
  number: (value) => stringify(value),
  object: (value) => stringify(value),
  string: (value) => stringify(value),
}

export function DocumentContextualMenu<T extends { _id: MongoData }>(props: {
  hidden: boolean
  onDismiss(): void
  target?: MouseEvent
  selectedItems: T[]
  onEdit?(): void
}) {
  const { connection, database, collection } = useSelector(
    (state) => state.root,
  )
  const dispatch = useDispatch()
  const handleDelete = useCallback(
    async (ids: MongoData[]) => {
      await runCommand(connection, database!, {
        delete: collection,
        deletes: ids.map((id) => ({
          q: { _id: id },
          limit: 1,
        })),
      })
      dispatch(actions.docs.setShouldRevalidate())
    },
    [database, collection],
  )
  const theme = getTheme()
  const [hidden, setHidden] = useState(true)

  return (
    <>
      <Dialog
        hidden={hidden}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Delete Document(s)',
          subText: props.selectedItems
            .map((item) => stringify(item._id))
            .join('\n'),
          onDismiss() {
            setHidden(true)
          },
        }}
        modalProps={{
          styles: {
            main: {
              minHeight: 0,
              borderTop: `4px solid ${theme.palette.red}`,
              backgroundColor: theme.palette.neutralLighterAlt,
            },
          },
          onDismiss() {
            setHidden(true)
          },
        }}>
        <DialogFooter>
          <DefaultButton
            onClick={async () => {
              await handleDelete(props.selectedItems.map((item) => item._id))
              setHidden(true)
            }}
            text="Delete"
          />
        </DialogFooter>
      </Dialog>
      <ContextualMenu
        target={props.target}
        hidden={props.hidden}
        onDismiss={props.onDismiss}
        items={[
          {
            key: '0',
            text: 'Edit',
            disabled: !props.onEdit,
            iconProps: { iconName: 'PageEdit' },
            onClick: props.onEdit,
          },
          {
            key: '1',
            text: 'Copy',
            iconProps: { iconName: 'Copy' },
            subMenuProps: {
              items: [
                {
                  key: '1-1',
                  text: 'as JavaScript Code',
                  secondaryText: 'array',
                  onClick() {
                    window.navigator.clipboard.writeText(
                      props.selectedItems.length === 1
                        ? stringify(props.selectedItems[0], 2)
                        : stringify(props.selectedItems, 2),
                    )
                  },
                },
                {
                  key: '1-2',
                  text: 'as JavaScript Code',
                  secondaryText: 'line',
                  onClick() {
                    window.navigator.clipboard.writeText(
                      props.selectedItems
                        .map((item) => stringify(item))
                        .join('\n'),
                    )
                  },
                },
                {
                  key: '1-3',
                  text: 'as Extended JSON (v2)',
                  secondaryText: 'array',
                  onClick() {
                    window.navigator.clipboard.writeText(
                      props.selectedItems.length === 1
                        ? JSON.stringify(props.selectedItems[0], null, 2)
                        : JSON.stringify(props.selectedItems, null, 2),
                    )
                  },
                },
                {
                  key: '1-4',
                  text: 'as Extended JSON (v2)',
                  secondaryText: 'line',
                  onClick() {
                    window.navigator.clipboard.writeText(
                      props.selectedItems
                        .map((item) => JSON.stringify(item))
                        .join('\n'),
                    )
                  },
                },
                {
                  key: '1-5',
                  text: 'as CSV',
                  secondaryText: 'without header',
                  onClick() {
                    csv(props.selectedItems, { cast }, (_err, text) => {
                      if (text) {
                        window.navigator.clipboard.writeText(text)
                      }
                    })
                  },
                },
                {
                  key: '1-6',
                  text: 'as CSV',
                  secondaryText: 'with header',
                  onClick() {
                    csv(
                      props.selectedItems,
                      { header: true, cast },
                      (_err, text) => {
                        if (text) {
                          window.navigator.clipboard.writeText(text)
                        }
                      },
                    )
                  },
                },
              ],
            },
          },
          {
            key: '2',
            text: 'Delete',
            iconProps: { iconName: 'Delete' },
            onClick() {
              setHidden(false)
            },
          },
        ]}
      />
    </>
  )
}
