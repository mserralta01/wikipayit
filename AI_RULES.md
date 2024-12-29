# AI Development Rules for WikiPayIt

## Wiki Maintenance and Documentation

1. **Documentation First Development**
   - Before writing any code, update the Wiki with the planned changes
   - Document the purpose and scope of new features
   - Outline expected interactions with existing systems
   - Define new types and interfaces in the Wiki
   - Always check and update markdown.md for file structure documentation

2. **File Structure Documentation**
   - Always reference and update markdown.md for:
     - New file additions
     - Directory structure changes
     - Component organization
     - Service layer modifications
     - Type definitions location
   - Keep markdown.md as the single source of truth for project structure
   - Update the file tree in markdown.md when:
     - Adding new directories
     - Creating new components
     - Adding new services
     - Implementing new features
   - Include in markdown.md for each file:
     - File purpose
     - Key dependencies
     - Main functionalities
     - Integration points
   - Format the file structure consistently:
     ```
     └── 📁directory
         └── file.tsx - [Purpose]
         └── 📁subdirectory
             └── component.tsx - [Purpose]
     ```

3. **File Documentation Requirements**
   ```markdown
   ### File: [relative_path/filename]
   
   **Purpose**: [Brief description of the file's purpose]
   **Type**: [Component|Service|Hook|Context|Type|Config]
   
   **Dependencies**:
   - Import A from '@/components/...' - [Purpose of import]
   - Import B from '@/services/...' - [Purpose of import]
   
   **Exports**:
   - ComponentName - [Description and usage]
   - interfaceName - [Type definition purpose]
   
   **Interactions**:
   - Interacts with ServiceA for data fetching
   - Updates ContextB for state management
   - Triggers EventC for user actions
   
   **State Management**:
   - Local State: [Description of local state]
   - Global State: [Description of global state usage]
   
   **Key Functionalities**:
   1. Function A - [Purpose and usage]
   2. Function B - [Purpose and usage]
   
   **Examples**:
   ```typescript
   // Usage example
   ```
   ```

4. **Feature Documentation Template**
   ```markdown
   ### Feature: [Feature Name]
   
   **Overview**: [Brief description]
   
   **Components**:
   - ComponentA - [Purpose]
   - ComponentB - [Purpose]
   
   **Services**:
   - ServiceA - [Purpose]
   - ServiceB - [Purpose]
   
   **Data Flow**:
   1. Step 1: [Description]
   2. Step 2: [Description]
   
   **Database Changes**:
   - Collection A: [New fields/changes]
   - Collection B: [New fields/changes]
   
   **API Endpoints**:
   - POST /api/... - [Purpose]
   - GET /api/... - [Purpose]
   ```

5. **Documentation Update Rules**
   - Update Wiki before creating a PR
   - Include all new files and changes
   - Document all new types and interfaces
   - Update architecture diagrams if needed
   - Document all new environment variables
   - Update API documentation
   - Add examples for complex features

6. **System Integration Documentation**
   - Document all external service integrations
   - Update authentication flows
   - Document new environment variables
   - Update deployment requirements
   - Document new build steps

7. **Wiki Sections to Update**
   - System Architecture
     - Add new components
     - Update data flow diagrams
     - Document new services
   
   - API Documentation
     - New endpoints
     - Changed responses
     - New error codes
   
   - Database Schema
     - New collections
     - Modified fields
     - New indexes
   
   - State Management
     - New contexts
     - Modified states
     - New reducers
   
   - Security
     - New auth rules
     - Modified permissions
     - API key changes

8. **Code Example Documentation**
   - Include TypeScript interfaces
   - Show usage examples
   - Document edge cases
   - Include error handling
   - Show integration examples

9. **Changelog Requirements**
   ```markdown
   ## Version X.Y.Z
   
   ### Added
   - New feature A
   - New component B
   
   ### Changed
   - Modified feature C
   - Updated component D
   
   ### Fixed
   - Bug fix in feature E
   - Performance improvement in F
   
   ### Breaking Changes
   - API change in endpoint X
   - Type modification in Y
   ```

## Core Development Principles

1. **TypeScript Safety**
   - Every piece of code output must be type-safe TypeScript
   - No `any` types unless absolutely necessary
   - Use proper type definitions for all components and functions
   - Maintain strict TypeScript configuration

2. **Component Architecture**
   - Admin components must use ShadcnUI
   - Public components should use custom Tailwind CSS
   - Maintain clear separation between admin and public interfaces
   - Follow React Server Component patterns where applicable

3. **State Management**
   - Use React Context for global state
   - Implement proper caching strategies
   - Follow service-based architecture
   - Maintain clear data flow patterns

## Code Generation Rules

1. **File Completeness**
   - Generate complete files without truncation
   - Include all necessary imports
   - Include all type definitions
   - Never use placeholders or ellipsis

2. **Documentation**
   - Include JSDoc comments for components and functions
   - Document complex business logic
   - Maintain clear code organization
   - Add TODO comments for future improvements

3. **Error Handling**
   - Implement proper error boundaries
   - Include loading states
   - Handle edge cases
   - Provide user feedback

## UI/UX Guidelines

1. **Admin Interface**
   ```typescript
   // Required ShadcnUI components
   import {
     Button,
     Input,
     Form,
     Select,
     Dialog,
     DropdownMenu,
     Table,
     Tabs,
     Card,
     Toast,
     Switch
   } from "@/components/ui"
   ```

2. **Public Interface**
   - Use custom components with Tailwind CSS
   - Implement beautiful and effective UI
   - Focus on user experience
   - Maintain responsive design

## Firebase Integration Rules

1. **Authentication**
   ```typescript
   // Always implement proper auth checks
   const authCheck = async () => {
     const user = auth.currentUser;
     if (!user) {
       throw new Error('No authenticated user');
     }
     return user;
   };
   ```

2. **Database Operations**
   - Use proper security rules
   - Implement data validation
   - Handle offline scenarios
   - Maintain data consistency

## Communication Features

1. **Email Templates**
   ```typescript
   interface EmailTemplate {
     id: string;
     name: string;
     subject: string;
     content: string;
     isEnabled: boolean;
     description: string;
     lastModified?: Date;
   }
   ```

2. **Activity Tracking**
   ```typescript
   interface CommunicationActivity {
     type: 'email' | 'call' | 'note';
     metadata: {
       subject?: string;
       content?: string;
       duration?: string;
       outcome?: string;
     };
   }
   ```

## Security Guidelines

1. **API Keys**
   - Never expose API keys in code
   - Use environment variables
   - Implement proper key rotation
   - Maintain secure key storage

2. **Data Access**
   - Implement role-based access
   - Validate user permissions
   - Secure sensitive data
   - Log security events

## Performance Rules

1. **Caching**
   ```typescript
   // Example caching implementation
   let cachedData: Data[] | null = null;
   let lastFetch = 0;
   const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

   const getData = async () => {
     if (cachedData && (Date.now() - lastFetch) < CACHE_DURATION) {
       return cachedData;
     }
     // Fetch and cache data
   };
   ```

2. **Loading States**
   - Implement skeleton loading
   - Show progress indicators
   - Handle timeout scenarios
   - Provide feedback for long operations

## Error Handling Rules

1. **User Feedback**
   ```typescript
   try {
     // Operation
   } catch (error) {
     console.error('Operation failed:', error);
     throw new Error('User-friendly error message');
   }
   ```

2. **Error Boundaries**
   - Implement component-level error boundaries
   - Provide fallback UI
   - Log errors properly
   - Handle recovery scenarios

## Testing Guidelines

1. **Component Testing**
   - Test all user interactions
   - Verify error states
   - Check loading scenarios
   - Validate accessibility

2. **Integration Testing**
   - Test Firebase integration
   - Verify API connections
   - Check data flow
   - Validate business logic

## Deployment Rules

1. **Build Process**
   - Verify TypeScript compilation
   - Check for type errors
   - Validate environment variables
   - Optimize assets

2. **Environment Configuration**
   - Maintain separate environments
   - Configure proper Firebase projects
   - Set up monitoring
   - Implement logging

## Maintenance Guidelines

1. **Code Quality**
   - Regular dependency updates
   - Code cleanup
   - Performance optimization
   - Security patches

2. **Documentation**
   - Keep wiki updated
   - Document API changes
   - Maintain changelog
   - Update deployment guides

## Feature Development Rules

1. **Lead Management**
   - Implement proper status tracking
   - Maintain communication history
   - Track pipeline progress
   - Handle state transitions

2. **Merchant Processing**
   - Validate application data
   - Implement proper workflows
   - Handle document management
   - Track processing status

## Mobile Optimization

1. **Responsive Design**
   - Mobile-first approach
   - Touch-friendly interfaces
   - Optimize for different screens
   - Handle offline scenarios

2. **Performance**
   - Optimize asset loading
   - Implement lazy loading
   - Handle network conditions
   - Cache critical data 