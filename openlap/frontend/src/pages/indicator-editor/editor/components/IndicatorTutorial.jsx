import React from 'react';
import Joyride from 'react-joyride';

const IndicatorTutorial = ({ run, setRun }) => {
  const steps = [
    {
      target: '[data-tour-id="basic-indicator"]',
      content: 'Click here to start creating a simple 4-step indicator.',
    },
    {
      target: '[data-tour-id="composite-indicator"]',
      content: 'Use this to create a composite indicator from multiple others.',
    },
    {
      target: '[data-tour-id="multi-level-indicator"]',
      content: 'This lets you define multi-level indicators using shared data columns.',
    }
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      callback={(data) => {
        if (["finished", "skipped"].includes(data.status)) setRun(false);
      }}
      styles={{
        options: {
          zIndex: 2000,
          arrowColor: '#1e88e5',              // blue arrow
          backgroundColor: '#ffffff',         // white card background
          overlayColor: 'rgba(0,0,0,0.4)',     // semi-transparent black overlay
          primaryColor: '#1e88e5',            // blue buttons (Next, Skip)
          textColor: '#333333',               // dark text
          width: 400
        }
      }}
    />
  );
};

export default IndicatorTutorial; 