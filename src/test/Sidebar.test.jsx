import { render, screen } from "@testing-library/react";
import Sidebar from "../components/Sidebar";
import nominations from "../data/nominations.json";

describe("Sidebar", () => {
  it("renders all categories", () => {
    render(<Sidebar seen={[]} />);
    nominations.forEach((cat) => {
      expect(screen.getByText(cat.category)).toBeInTheDocument();
    });
  });
});
