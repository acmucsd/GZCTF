import React, { FC } from 'react'
import { useParams } from 'react-router-dom'
import { Paper, ScrollArea, createStyles, Table, Group, Text, Avatar } from '@mantine/core'
import { Icon } from '@mdi/react'
import api, { ChallengeInfo, ChallengeTag, ScoreboardItem, SubmissionType } from '@Api/Api'
import { ChallengeTagLabelMap, SubmissionTypeIconMap } from './ChallengeItem'

const useStyles = createStyles((theme) => ({
  table: {
    '& thead tr th, & tbody tr td': {
      textAlign: 'center',
      padding: '8px',
      fontSize: 12,
    },
  },
  theadFixLeft: {
    position: 'sticky',
  },
  theadHeader: {
    fontWeight: 'bold',
    maxWidth: '2rem',
  },
  theadTag: {},
  theadName: {},
  theadMono: {
    fontWeight: 'bold',
    fontFamily: theme.fontFamilyMonospace,
  },
  noBorder: {
    border: 'none !important',
  },
}))

const TableHeader = (table: Record<string, ChallengeInfo[]>) => {
  const { classes, cx, theme } = useStyles()
  const hiddenCol = [...Array(4).keys()].map((i) => (
    <th key={i} className={cx(classes.theadFixLeft, classes.noBorder)}>
      &nbsp;
    </th>
  ))

  return (
    <thead>
      {/* Challenge Tag */}
      <tr>
        {hiddenCol}
        {Object.keys(table).map((key) => {
          const tag = ChallengeTagLabelMap.get(key as ChallengeTag)!
          return (
            <th key={key} className={classes.theadTag} colSpan={table[key].length}>
              <Group spacing={4} noWrap position="center" style={{ width: '100%' }}>
                <Icon path={tag.icon} size={1} color={theme.colors[tag.color][8]} />
                <Text color={tag.color}>{key}</Text>
              </Group>
            </th>
          )
        })}
      </tr>
      {/* Challenge Name */}
      <tr>
        {hiddenCol}
        {Object.keys(table).map((key) =>
          table[key].map((item) => (
            <th key={item.id} className={classes.theadName}>
              {item.title}
            </th>
          ))
        )}
      </tr>
      {/* Headers & Score */}
      <tr>
        {['排名', '战队', '解题数量', '总分'].map((header, idx) => (
          <th key={idx} className={cx(classes.theadFixLeft, classes.theadHeader)}>
            {header}
          </th>
        ))}
        {Object.keys(table).map((key) =>
          table[key].map((item) => (
            <th key={item.id} className={classes.theadMono}>
              {item.score}
            </th>
          ))
        )}
      </tr>
    </thead>
  )
}

const TableRow: FC<{
  rank: number
  item: ScoreboardItem
  iconMap: Map<SubmissionType, React.ReactNode>
  challenges?: Record<string, ChallengeInfo[]>
}> = ({ rank, item, challenges, iconMap }) => {
  const { classes, cx } = useStyles()
  const solved = item.challenges?.filter((c) => c.type !== SubmissionType.Unaccepted)
  return (
    <tr>
      <td className={cx(classes.theadMono, classes.theadFixLeft)}>{rank + 1}</td>
      <td className={cx(classes.theadFixLeft)}>
        <Group position="left" spacing={5} noWrap style={{ width: '100%' }}>
          <Avatar src={item.avatar} radius="xl" size={30} color="brand">
            {item.name?.at(0) ?? 'T'}
          </Avatar>
          <Text lineClamp={1} style={{ fontWeight: 700 }}>
            {item.name}
          </Text>
        </Group>
      </td>
      <td className={cx(classes.theadMono, classes.theadFixLeft)}>{solved?.length}</td>
      <td className={cx(classes.theadMono, classes.theadFixLeft)}>
        {solved?.reduce((acc, cur) => acc + (cur?.score ?? 0), 0)}
      </td>
      {challenges &&
        Object.keys(challenges).map((key) =>
          challenges[key].map((item) => (
            <td key={item.id} className={classes.theadMono}>
              {iconMap.get(
                solved?.find((c) => c.id === item.id)?.type ?? SubmissionType.Unaccepted
              )}
            </td>
          ))
        )}
    </tr>
  )
}

const ScoreboardTable: FC = () => {
  const { id } = useParams()
  const numId = parseInt(id ?? '-1')
  const { classes } = useStyles()
  const base = 0
  const { data: scoreboard } = api.game.useGameScoreboard(numId, {
    refreshInterval: 0,
  })
  const iconMap = SubmissionTypeIconMap(1)

  return (
    <Paper shadow="md" p="md">
      <ScrollArea style={{ width: '100%' }}>
        <Table className={classes.table}>
          <TableHeader {...scoreboard?.challenges} />
          <tbody>
            {scoreboard?.items?.map((item, idx) => (
              <TableRow
                key={base + idx}
                item={item}
                rank={base + idx}
                challenges={scoreboard.challenges}
                iconMap={iconMap}
              />
            ))}
          </tbody>
        </Table>
      </ScrollArea>
    </Paper>
  )
}

export default ScoreboardTable