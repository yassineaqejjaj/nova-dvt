import type { Preview } from "@storybook/react";
import "../src/index.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        {
          name: "light",
          value: "hsl(0 0% 100%)",
        },
        {
          name: "dark",
          value: "hsl(222.2 84% 4.9%)",
        },
      ],
    },
  },
};

export default preview;
