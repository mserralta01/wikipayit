# Testing Checklist

## Notes Functionality
- [ ] Create a new note
  - [ ] With pinned status
  - [ ] Without pinned status
- [ ] Delete a note
- [ ] Toggle pin status
- [ ] Verify sorting (pinned notes first, then by date)
- [ ] Verify error handling
  - [ ] Network errors
  - [ ] Invalid input
- [ ] Check loading states

## Phone Calls Functionality
- [ ] Log a new phone call
  - [ ] With different outcomes
  - [ ] With different durations
- [ ] Delete a phone call record
- [ ] Verify sorting by date
- [ ] Verify error handling
  - [ ] Network errors
  - [ ] Invalid input
- [ ] Check loading states

## General Features
- [ ] Query invalidation after mutations
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly
- [ ] Form validation works
- [ ] Data persistence in Firebase
- [ ] CORS configuration works for file uploads
- [ ] Real-time updates work correctly

## Edge Cases
- [ ] Handle offline state
- [ ] Handle server errors
- [ ] Handle concurrent updates
- [ ] Handle large datasets
- [ ] Handle special characters in input

## Performance
- [ ] Check load times
- [ ] Verify memory usage
- [ ] Check network requests
- [ ] Verify caching behavior 