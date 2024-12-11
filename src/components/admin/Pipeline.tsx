import React from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { styled, Theme } from '@mui/material/styles'
import {
  AppBar,
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Divider,
  LinearProgressProps,
  SxProps
} from '@mui/material'
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Mail as MailIcon,
  Message as MessageIcon,
  Download as DownloadIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  Email as EmailIcon,
  Person as PersonIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { merchantService } from '../../services/merchantService'
import { CardModal } from './CardModal'
import { format } from 'date-fns'
import {
  PipelineStatus,
  PipelineItem,
  PipelineLead,
  PipelineMerchant,
  Column,
  PIPELINE_STATUSES,
  COLUMN_CONFIGS,
  isPipelineLead,
  isPipelineMerchant
} from '../../types/pipeline'
import {
  calculateProgress,
  transformServiceResponse
} from '../../services/pipelineTransforms'

interface CustomLinearProgressProps extends LinearProgressProps {
  progresscolor: string;
}

const Root = styled('div')(({ theme }: { theme: Theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  backgroundColor: theme.palette.background.default
}))

const Header = styled(AppBar)(({ theme }: { theme: Theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`
}))

const ColumnHeader = styled(Box)(({ theme }: { theme: Theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(0,0,0,0.08)',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}))

const ColumnContainer = styled(Paper)(({ theme }: { theme: Theme }) => ({
  width: 280,
  backgroundColor: '#f5f5f5',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
  margin: theme.spacing(1),
  minHeight: 'calc(100vh - 100px)'
}))

const CardContainer = styled(Card)(({ theme }: { theme: Theme }) => ({
  backgroundColor: '#fff',
  borderRadius: 8,
  margin: 8,
  padding: 12,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    transform: 'translateY(-2px)'
  }
}))

const ProgressBarContainer = styled(Box)(({ theme }: { theme: Theme }) => ({
  marginTop: theme.spacing(1),
  padding: theme.spacing(1, 0)
}))

const CustomLinearProgress = styled(LinearProgress, {
  shouldForwardProp: (prop) => prop !== 'progresscolor'
})<CustomLinearProgressProps>(({ theme, progresscolor }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(0,0,0,0.08)',
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    backgroundColor: progresscolor,
    backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)',
    backgroundSize: '1rem 1rem',
    animation: 'progress-animation 1s linear infinite'
  },
  '@keyframes progress-animation': {
    '0%': {
      backgroundPosition: '1rem 0'
    },
    '100%': {
      backgroundPosition: '0 0'
    }
  }
}))

const getProgressColor = (progress: number): string => {
  if (progress < 25) return '#ef5350'
  if (progress < 50) return '#ff9800'
  if (progress < 75) return '#66bb6a'
  return '#2196f3'
}

const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  return format(new Date(date), 'MMM d, yyyy')
}

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  const progressColor = getProgressColor(progress)
  
  return (
    <ProgressBarContainer>
      <Box display="flex" justifyContent="space-between" mb={0.5}>
        <Typography variant="caption">Progress</Typography>
        <Typography variant="caption">{progress}%</Typography>
      </Box>
      <CustomLinearProgress
        variant="determinate"
        value={progress}
        progresscolor={progressColor}
      />
    </ProgressBarContainer>
  )
}

const LeadCard: React.FC<{
  item: PipelineLead
  onMenuOpen: (event: React.MouseEvent<HTMLElement>) => void
}> = ({ item, onMenuOpen }) => {
  const { email, formData, createdAt } = item
  const progress = calculateProgress(item)
  const config = COLUMN_CONFIGS[item.pipelineStatus]

  const commonSx: SxProps = {
    display: 'flex',
    alignItems: 'center',
    gap: 1
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Box flex={1}>
          <Box sx={commonSx} mb={1}>
            <Chip
              label={item.pipelineStatus}
              size="small"
              style={{ backgroundColor: config.color, color: '#fff' }}
            />
            <Typography variant="caption" color="textSecondary">
              {formatDate(createdAt)}
            </Typography>
          </Box>
          <Box sx={commonSx}>
            <EmailIcon fontSize="small" color="primary" />
            <Typography variant="body2" noWrap>{email}</Typography>
          </Box>
          {formData?.businessName && (
            <Box sx={{ ...commonSx, mt: 0.5 }}>
              <BusinessIcon fontSize="small" color="action" />
              <Typography variant="body2" color="textSecondary" noWrap>
                {formData.businessName}
              </Typography>
            </Box>
          )}
          {formData?.firstName && formData?.lastName && (
            <Box sx={{ ...commonSx, mt: 0.5 }}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="body2" color="textSecondary" noWrap>
                {`${formData.firstName} ${formData.lastName}`}
              </Typography>
            </Box>
          )}
        </Box>
        <IconButton
          size="small"
          onClick={onMenuOpen}
          sx={{ ml: 1 }}
        >
          <MoreVertIcon />
        </IconButton>
      </Box>
      <ProgressBar progress={progress} />
    </Box>
  )
}

const MerchantCard: React.FC<{
  item: PipelineMerchant
  onMenuOpen: (event: React.MouseEvent<HTMLElement>) => void
}> = ({ item, onMenuOpen }) => {
  const progress = calculateProgress(item)
  const config = COLUMN_CONFIGS[item.pipelineStatus]

  const commonSx: SxProps = {
    display: 'flex',
    alignItems: 'center',
    gap: 1
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Box flex={1}>
          <Box sx={commonSx} mb={1}>
            <Chip
              label={item.pipelineStatus}
              size="small"
              style={{ backgroundColor: config.color, color: '#fff' }}
            />
            <Typography variant="caption" color="textSecondary">
              {formatDate(item.createdAt)}
            </Typography>
          </Box>
          <Typography variant="subtitle2" noWrap>{item.businessName}</Typography>
          {item.dba && (
            <Typography variant="body2" color="textSecondary" noWrap>
              DBA: {item.dba}
            </Typography>
          )}
          <Box sx={{ ...commonSx, mt: 0.5 }}>
            <BusinessIcon fontSize="small" color="action" />
            <Typography variant="body2" color="textSecondary" noWrap>
              {item.businessType}
            </Typography>
          </Box>
          {item.monthlyVolume && (
            <Box sx={{ ...commonSx, mt: 0.5 }}>
              <MoneyIcon fontSize="small" color="action" />
              <Typography variant="body2" color="textSecondary" noWrap>
                ${Number(item.monthlyVolume).toLocaleString()}/mo
              </Typography>
            </Box>
          )}
        </Box>
        <IconButton
          size="small"
          onClick={onMenuOpen}
          sx={{ ml: 1 }}
        >
          <MoreVertIcon />
        </IconButton>
      </Box>
      <ProgressBar progress={progress} />
    </Box>
  )
}

export default function Pipeline() {
  const queryClient = useQueryClient()
  const [selectedItem, setSelectedItem] = React.useState<PipelineItem | null>(null)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [selectedItemForMenu, setSelectedItemForMenu] = React.useState<PipelineItem | null>(null)
  
  const { data: pipelineItems = [], isLoading } = useQuery({
    queryKey: ['pipeline-items'],
    queryFn: async () => {
      const items = await merchantService.getPipelineItems()
      return transformServiceResponse(items)
    }
  })

  const updateItemStatus = useMutation({
    mutationFn: async (variables: { id: string; status: PipelineStatus }) => {
      const merchantStatus = variables.status === 'approved' ? 'approved' : 'pending'
      await merchantService.updateMerchantStatus(variables.id, merchantStatus)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-items'] })
    }
  })

  const filterByStatus = React.useCallback((status: PipelineStatus) => (item: PipelineItem) => {
    return item.pipelineStatus === status
  }, [])

  const columns: Column[] = React.useMemo(() => 
    PIPELINE_STATUSES.map(status => ({
      id: status,
      ...COLUMN_CONFIGS[status],
      items: pipelineItems.filter(filterByStatus(status))
    })), [pipelineItems, filterByStatus])

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: PipelineItem) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setSelectedItemForMenu(item)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedItemForMenu(null)
  }

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { draggableId, destination } = result
    const newStatus = destination.droppableId as PipelineStatus

    await updateItemStatus.mutateAsync({
      id: draggableId,
      status: newStatus
    })
  }

  const handleCardClick = (item: PipelineItem) => {
    setSelectedItem(item)
  }

  const handleStatusChange = async (
    item: PipelineItem,
    newStatus: PipelineStatus
  ) => {
    try {
      if (isPipelineMerchant(item)) {
        // Check if the document exists before updating
        const merchantDoc = await merchantService.getMerchant(item.id);
        if (!merchantDoc) {
          console.error("Merchant document not found:", item.id);
          // Handle the error appropriately, e.g., show a message to the user
          return;
        }

        await merchantService.updateMerchantStatus(item.id, newStatus);
      } else if (isPipelineLead(item)) {
        await merchantService.updateLeadStatus(item.id, newStatus);
      }
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
    } catch (error) {
      console.error("Error updating merchant status:", error);
      // Handle the error appropriately, e.g., show a message to the user
    }
  };

  const renderCardContent = React.useCallback((item: PipelineItem): React.ReactNode => {
    if (isPipelineLead(item)) {
      return (
        <LeadCard
          item={item}
          onMenuOpen={(e) => handleMenuOpen(e, item)}
        />
      )
    }

    if (isPipelineMerchant(item)) {
      return (
        <MerchantCard
          item={item}
          onMenuOpen={(e) => handleMenuOpen(e, item)}
        />
      )
    }

    return null
  }, [])

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
        <Typography>Loading pipeline...</Typography>
      </Box>
    )
  }

  return (
    <Root>
      <Header position="static">
        <Toolbar>
          <Typography variant="h6" fontWeight="medium" sx={{ flexGrow: 1 }}>
            Pipeline
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            color="primary"
          >
            Add Merchant
          </Button>
        </Toolbar>
      </Header>

      <Box
        sx={{
          display: 'flex',
          overflowX: 'auto',
          padding: 2,
          gap: 2,
          flexGrow: 1
        }}
      >
        <DragDropContext onDragEnd={onDragEnd}>
          {columns.map(column => (
            <ColumnContainer key={column.id} elevation={0}>
              <ColumnHeader>
                <Typography variant="subtitle1" fontWeight="medium">
                  {column.title} ({column.items.length})
                </Typography>
              </ColumnHeader>

              <Droppable droppableId={column.id}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{ minHeight: 100 }}
                  >
                    {column.items.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <CardContainer
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => handleCardClick(item)}
                            elevation={snapshot.isDragging ? 3 : 1}
                            sx={{
                              transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                              transition: 'transform 0.2s ease'
                            }}
                          >
                            {renderCardContent(item)}
                          </CardContainer>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </ColumnContainer>
          ))}
        </DragDropContext>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedItemForMenu) {
            handleCardClick(selectedItemForMenu)
            handleMenuClose()
          }
        }}>
          Open Details
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <MailIcon fontSize="small" sx={{ mr: 1 }} />
          Send Email
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <MessageIcon fontSize="small" sx={{ mr: 1 }} />
          Add Note
        </MenuItem>
        {selectedItemForMenu && isPipelineMerchant(selectedItemForMenu) && (
          <MenuItem onClick={handleMenuClose}>
            <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
            Download Documents
          </MenuItem>
        )}
      </Menu>

      {selectedItem && (
        <CardModal
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          item={selectedItem}
          onStatusChange={handleStatusChange}
        />
      )}
    </Root>
  )
}
