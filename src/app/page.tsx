import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Gamepad2,
  Search,
  Library,
  Clock,
  Plus,
  ExternalLink,
  Laptop,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const stats = [
    {
      label: "Total Games",
      value: "148",
      icon: Gamepad2,
      desc: "+12 this month",
    },
    {
      label: "Playtime",
      value: "342h",
      icon: Clock,
      desc: "Avg. 2.3h / session",
    },
    {
      label: "Synced Platforms",
      value: "3",
      icon: Laptop,
      desc: "Steam, Epic, GOG",
    },
  ];

  const recentGames = [
    {
      title: "Elden Ring",
      developer: "FromSoftware",
      playtime: "128 hrs",
      platform: "STEAM",
      status: "Synced",
      genre: "RPG",
    },
    {
      title: "Hades II",
      developer: "Supergiant Games",
      playtime: "34 hrs",
      platform: "STEAM",
      status: "Synced",
      genre: "Action Roguelike",
    },
    {
      title: "Cyberpunk 2077",
      developer: "CD Projekt Red",
      playtime: "86 hrs",
      platform: "GOG",
      status: "Synced",
      genre: "Sci-Fi RPG",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-foreground font-sans">
      <main>
        <p>Hello</p>
      </main>
    </div>
  );
}
