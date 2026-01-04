# Globle Solver

A powerful web-based tool designed to help you solve the daily [Globle](https://globle-game.com/) challenge. By inputting the countries you guess and the distances returned by the game, this tool visualizes potential candidates and narrows down the mystery country for you.

## 🚀 Features

*   **Interactive Map**: Visualize countries and their positions on a fully interactive world map powered by Leaflet.
*   **Distance-Based Filtering**: Input the distance obtained from the Globle game to mathematically filter down possible candidate countries.
*   **Smart Suggestions**: Automatically calculates and highlights potential countries based on the clues provided using geodesic measurements.
*   **Performance Optimized**: Uses dedicated Web Workers (`solver.worker.js`) to handle complex geospatial calculations in the background, ensuring a smooth and responsive UI.
*   **Responsive Design**: Fully responsive interface that works seamlessly on desktop and mobile devices.
*   **Territory Support**: Toggle option to include or exclude dependent territories in the search effectively.

## 🛠️ Tech Stack

*   **Frontend Framework**: [React](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Map Library**: [React Leaflet](https://react-leaflet.js.org/) & [Leaflet](https://leafletjs.com/)
*   **Geospatial Processing**: [Turf.js](https://turfjs.org/) & [D3-geo](https://d3js.org/d3-geo)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Icons**: [Lucide React](https://lucide.dev/)

## 📦 Installation

To get a local copy up and running follow these simple steps.

### Prerequisites

*   Node.js (v14 or higher recommended)
*   npm (usually comes with Node.js)

### Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/globle_solver.git
    cd globle_solver
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  **Open in your browser**
    Visit `http://localhost:5173` (or the URL shown in your terminal).

## 📖 Usage

1.  **Make a Guess**: In the official Globle game, make a guess.
2.  **Input Data**:
    *   **Select Country**: In the Globle Solver, select the country you just guessed (via the map or the sidebar search).
    *   **Enter Distance**: Input the distance (in km) revealed by the Globle game.
3.  **Add Clue**: Click "Add Clue". The app will calculate which countries are valid candidates based on that distance.
    *   **Green**: Solution candidates (possible mystery countries).
    *   **Gray**: Eliminated countries.
    *   **Red/Pink**: Your guesses/clues.
4.  **Refine**: Continue adding clues to narrow down the candidates until only one remains!

### Controls

*   **Reset**: clear all clues to start a new game.
*   **Include Territories**: Toggle this switch in the sidebar if you want to include dependent territories in the candidate list.

## 🏗️ Build for Production

To create a production-ready build:

```bash
npm run build
```

The output will be in the `dist` folder. You can deploy this folder to any static hosting service like GitHub Pages, Vercel, or Netlify.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is open source.

---

*Note: This project is a fan-made tool and is not affiliated with the official Globle game.*
