import { FC, useState } from 'react'
import { useNavigate } from 'react-router'
import { ActionIcon, Pagination, Stack } from '@mantine/core'
import { mdiPlus } from '@mdi/js'
import { Icon } from '@mdi/react'
import PostCard from '@Components/PostCard'
import StickyHeader from '@Components/StickyHeader'
import WithNavBar from '@Components/WithNavbar'
import { RequireRole } from '@Components/WithRole'
import { showErrorNotification } from '@Utils/ApiErrorHandler'
import { usePageTitle } from '@Utils/usePageTitle'
import { useUserRole } from '@Utils/useUser'
import api, { PostInfoModel, Role } from '@Api'

const ITEMS_PER_PAGE = 10

const Posts: FC = () => {
  const { data: posts, mutate } = api.info.useInfoGetPosts({
    refreshInterval: 0,
    revalidateIfStale: false,
    revalidateOnFocus: false,
  })

  const [activePage, setPage] = useState(1)
  const navigate = useNavigate()
  const { role } = useUserRole()

  usePageTitle('文章')

  const onTogglePinned = (post: PostInfoModel, setDisabled: (value: boolean) => void) => {
    setDisabled(true)
    api.edit
      .editUpdatePost(post.id, { title: post.title, isPinned: !post.isPinned })
      .then((res) => {
        if (post.isPinned) {
          mutate([
            ...(posts?.filter((p) => p.id !== post.id && p.isPinned) ?? []),
            { ...res.data },
            ...(posts?.filter((p) => p.id !== post.id && !p.isPinned) ?? []),
          ])
        } else {
          mutate([
            { ...res.data },
            ...(posts?.filter((p) => p.id !== post.id && p.isPinned) ?? []),
            ...(posts?.filter((p) => p.id !== post.id && !p.isPinned) ?? []),
          ])
        }
        api.info.mutateInfoGetLatestPosts()
      })
      .catch(showErrorNotification)
      .finally(() => {
        setDisabled(false)
      })
  }

  return (
    <WithNavBar isLoading={!posts} minWidth={0}>
      <Stack justify="space-between">
        <StickyHeader />
        <Stack>
          {posts
            ?.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE)
            .map((post) => (
              <PostCard key={post.id} post={post} onTogglePinned={onTogglePinned} />
            ))}
        </Stack>
        {(posts?.length ?? 0) > ITEMS_PER_PAGE && (
          <Pagination
            position="center"
            my={20}
            page={activePage}
            onChange={setPage}
            total={Math.ceil((posts?.length ?? 0) / ITEMS_PER_PAGE)}
          />
        )}
      </Stack>
      {RequireRole(role, Role.Admin) && (
        <ActionIcon
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: 'calc(0.1 * (100vw - 70px) + 2rem)',
          }}
          size="xl"
          radius="xl"
          color="brand"
          variant="filled"
          onClick={() => navigate('/posts/new/edit')}
        >
          <Icon path={mdiPlus} size={1} />
        </ActionIcon>
      )}
    </WithNavBar>
  )
}

export default Posts