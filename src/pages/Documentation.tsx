import { ArduinoDocumentation } from "@/components/ArduinoDocumentation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Documentation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="lg">
              <ArrowLeft className="h-4 w-4" />
              Back to Game
            </Button>
          </Link>
        </div>

        <ArduinoDocumentation />
      </div>
    </div>
  );
};

export default Documentation;