import React from 'react'
import {
  IconButton,
  getTheme,
  Stack,
  CommandBarButton,
  ContextualMenuItemType,
} from '@fluentui/react'

import { Number } from '@/utils/formatter'

export function Pagination(props: {
  skip: number
  limit: number
  count: number
  onLimit(limit: number): void
  onPrev(): void
  onNext(): void
}) {
  const theme = getTheme()

  return (
    <Stack horizontal={true} styles={{ root: { alignItems: 'center' } }}>
      <CommandBarButton
        text={
          props.count
            ? `${props.skip + 1} ~ ${Math.min(
                props.skip + props.limit,
                props.count,
              )} of ${Number.format(props.count)}`
            : 'No Data'
        }
        style={{
          height: 32,
          color: theme.palette.neutralPrimary,
        }}
        menuProps={{
          items: [
            {
              key: '0',
              itemType: ContextualMenuItemType.Section,
              sectionProps: {
                title: 'Page Size',
                items: [25, 50, 100].map((l, i) => ({
                  key: i.toString(),
                  text: l.toString(),
                  checked: l === props.limit,
                  canCheck: true,
                  onClick() {
                    props.onLimit(l)
                  },
                })),
              },
            },
          ],
        }}
        menuIconProps={{ hidden: true }}
      />
      <IconButton
        iconProps={{ iconName: 'Back' }}
        disabled={props.skip <= 0}
        onClick={props.onPrev}
      />
      <IconButton
        iconProps={{ iconName: 'Forward' }}
        disabled={props.skip + props.limit >= props.count}
        onClick={props.onNext}
      />
    </Stack>
  )
}
