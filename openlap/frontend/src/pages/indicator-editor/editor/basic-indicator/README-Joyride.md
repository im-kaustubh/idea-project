# Basic Indicator Editor - Joyride Walkthrough Documentation

## Overview

This document describes the interactive Joyride walkthrough implementation for the Basic Indicator Editor. The walkthrough provides step-by-step guidance through the entire indicator creation process with validation-based progression.

## Features

- **Step-by-step validation**: Each step only appears after completing the previous one
- **Smart progression**: Automatically advances to the next available incomplete step
- **Visual highlighting**: Precise targeting of form elements with custom styling
- **Interactive guidance**: Tooltip warnings for locked steps with helpful messages
- **Persistent controls**: Floating action buttons for tour control
- **Responsive design**: Mobile-friendly with adaptive layouts
- **Accessibility**: Proper focus management and keyboard navigation

## Implementation Structure

### Core Files

1. **`basic-indicator.jsx`** - Main component with Joyride integration
2. **`utils/joyride-utils.js`** - Step validation and utility functions
3. **`utils/tour-steps.js`** - Tour step definitions and configuration
4. **`utils/joyride-styles.css`** - Custom CSS overrides for precise highlighting

### Step Flow

The walkthrough consists of 15 main steps:

1. **LRS Selection** (`.joyride-lrs-selector`)
2. **Platform Selection** (`.joyride-platform-selector`)
3. **Activity Type Selection** (`.joyride-activity-type-selector`)
4. **Activity Selection** (`.joyride-activity-selector`)
5. **Action Selection** (`.joyride-action-selector`)
6. **Date Range Configuration** (`.joyride-date-range`)
7. **Analysis Technique Selection** (`.joyride-analysis-technique`)
8. **Analysis Inputs Mapping** (`.joyride-analysis-inputs`)
9. **Analysis Parameters** (`.joyride-analysis-params`)
10. **Preview Analysis Data** (`.joyride-preview-data-btn`)
11. **Visualization Library Selection** (`.joyride-viz-library`)
12. **Visualization Type Selection** (`.joyride-viz-type`)
13. **Visualization Inputs Mapping** (`.joyride-viz-inputs`)
14. **Generate Preview** (`.joyride-generate-preview-btn`)
15. **Save Indicator** (`.joyride-submit-btn`)

## Key Functions

### Validation Functions

```javascript
// Check if a specific step is completed
validateStepCompletion(stepIndex, context)

// Check if user can proceed to a target step
canProceedToStep(targetStepIndex, context)

// Get the next incomplete step
getNextAvailableStep(context)

// Generate tooltip content for locked steps
getStepTooltipContent(stepIndex)
```

### Context Structure

The validation functions expect a context object with:

```javascript
{
  indicatorQuery: { lrsStores, platforms, activityTypes, ... },
  analysisRef: { analyticsTechniqueId, mapping, params, ... },
  visRef: { visualizationLibraryId, typeId, mapping, ... },
  indicator: { previewData: { displayCode, ... }, ... }
}
```

### Tour Control Functions

```javascript
// Start the tour from the next available step
startTour()

// Restart the tour from the beginning
restartTour()

// Stop the current tour
stopTour()
```

## Callback Logic

The `handleJoyrideCallback` function manages:

- **Step validation**: Prevents progression without completing prerequisites
- **Auto-advancement**: Moves to next step when current step is completed
- **Error handling**: Manages missing targets and navigation issues
- **User feedback**: Shows warning messages for invalid progression attempts

### Key Callback Events

- `EVENTS.STEP_AFTER`: Handles step navigation and validation
- `EVENTS.TARGET_NOT_FOUND`: Manages missing DOM elements
- `STATUS.FINISHED`: Resets tour on completion
- `STATUS.SKIPPED`: Handles tour cancellation

## Styling and Highlighting

### CSS Class Structure

Each interactive element has a corresponding CSS class:

```css
.joyride-[element-name] {
  /* Base positioning and styles */
}
```

### Highlight Specifications

- **Form elements**: 4px top/bottom padding, -4px left padding
- **Containers**: Subtle background and border highlighting
- **Buttons**: Enhanced shadow and hover effects
- **Responsive**: Mobile-optimized spacing and sizing

### Custom Tooltip Styles

- Modern design with gradient backgrounds
- Enhanced shadows and rounded corners
- Consistent color scheme matching MUI theme
- Progress indicators and improved button states

## Usage Examples

### Starting the Tour

```javascript
// From any component with access to BasicIndicatorContext
const { startTour } = useContext(BasicIndicatorContext);

// Start tour button
<Button onClick={startTour}>
  Start Guided Tour
</Button>
```

### Adding New Steps

1. **Add validation function** in `joyride-utils.js`:
```javascript
export const isNewStepCompleted = (context) => {
  return context.someProperty.length > 0;
};
```

2. **Update `validateStepCompletion`**:
```javascript
case 15: // New step index
  return isNewStepCompleted(context);
```

3. **Add step definition** in `tour-steps.js`:
```javascript
{
  target: '.joyride-new-step',
  content: (
    <div>
      <h3>New Step Title</h3>
      <p>Step description...</p>
    </div>
  ),
  placement: 'right',
  when: () => validateStepCompletion(14, context) && 
              !validateStepCompletion(15, context),
}
```

4. **Add CSS class** to target component:
```jsx
<ComponentName className="joyride-new-step" />
```

## Troubleshooting

### Common Issues

1. **Target not found**: Ensure CSS classes are properly applied to visible elements
2. **Step not appearing**: Check validation logic and `when` conditions
3. **Styling issues**: Verify CSS imports and class specificity
4. **Mobile layout**: Test responsive breakpoints and touch interactions

### Debug Mode

Enable debug logging by adding to callback:

```javascript
console.log('Joyride callback:', { action, index, status, type, lifecycle });
```

### Performance Considerations

- Steps are filtered by their `when` conditions to reduce memory usage
- Validation functions are optimized for quick execution
- CSS animations use hardware acceleration for smooth performance

## Best Practices

1. **Always validate prerequisites** before allowing step progression
2. **Provide clear feedback** for locked or unavailable steps
3. **Test on multiple screen sizes** to ensure responsive behavior
4. **Keep step content concise** but informative
5. **Use consistent visual styling** across all steps
6. **Handle edge cases** like missing data or API errors

## Browser Compatibility

- **Modern browsers**: Full support for CSS animations and backdrop-filter
- **Mobile browsers**: Optimized touch interactions and responsive layouts
- **Accessibility**: Screen reader compatibility and keyboard navigation

## Dependencies

- `react-joyride`: ^2.8.2
- `@mui/material`: ^6.1.1
- `@mui/icons-material`: ^6.1.1

## Future Enhancements

- [ ] Analytics tracking for tour completion rates
- [ ] Customizable tour paths based on user preferences
- [ ] Video integration for complex steps
- [ ] Multi-language support for international users
- [ ] Contextual help system beyond the guided tour