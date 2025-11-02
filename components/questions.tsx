"use client";
import { useState } from "react";
import { MessageCircle, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SortType = "most-voted" | "recent" | "least-voted";

type QuestionOrientation = "backend" | "frontend";

type Question = {
  id: string;
  title: string;
  description: string;
  votes: number;
  createdAt: string;
  orientation: QuestionOrientation;
  username: string;
};

// Datos de ejemplo
const initialQuestions: Question[] = [
  {
    id: "1",
    title: "¿Cuál es la diferencia entre var, let y const?",
    description:
      "Explica las diferencias y cuándo usar cada uno en JavaScript moderno. ¿Cuáles son las mejores prácticas?",
    votes: 35,
    createdAt: "5h ago",
    orientation: "frontend",
    username: "María López",
  },
  {
    id: "2",
    title: "¿Qué es el hoisting en JavaScript?",
    description:
      "Describe cómo funciona el hoisting y por qué es importante entenderlo para entrevistas técnicas.",
    votes: 27,
    createdAt: "1 day ago",
    orientation: "frontend",
    username: "Carlos Hernández",
  },
  {
    id: "3",
    title: "¿Qué son las promesas en JavaScript?",
    description:
      "Explica el concepto de promesas y async/await. ¿Cómo manejar errores correctamente?",
    votes: 16,
    createdAt: "4 days ago",
    orientation: "backend",
    username: "Laura Pérez",
  },
];

export function QuestionsSection() {
  const [sortType, setSortType] = useState<SortType>("most-voted");
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [userVotes, setUserVotes] = useState<Map<string, "up" | "down">>(
    new Map()
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionDescription, setNewQuestionDescription] = useState("");
  const [newQuestionOrientation, setNewQuestionOrientation] =
    useState<QuestionOrientation>("backend");

  const handleVote = (questionId: string, direction: "up" | "down") => {
    const currentVote = userVotes.get(questionId);

    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;

        let voteChange = 0;

        if (currentVote === undefined) {
          // Primera vez votando
          voteChange = direction === "up" ? 1 : -1;
        } else if (currentVote === direction) {
          // Hacer clic en el mismo botón: quitar el voto
          voteChange = direction === "up" ? -1 : 1;
        } else {
          // Cambiar de opinión: cambiar el voto
          // Si cambia de down a up: sumar 2 (quitar -1, agregar +1)
          // Si cambia de up a down: restar 2 (quitar +1, agregar -1)
          voteChange = direction === "up" ? 2 : -2;
        }

        return { ...q, votes: q.votes + voteChange };
      })
    );

    setUserVotes((prev) => {
      const newMap = new Map(prev);
      if (currentVote === direction) {
        // Si hace clic en el mismo botón, quitar el voto
        newMap.delete(questionId);
      } else {
        // Guardar el nuevo voto
        newMap.set(questionId, direction);
      }
      return newMap;
    });
  };

  const getUserVote = (questionId: string): "up" | "down" | null => {
    return userVotes.get(questionId) || null;
  };

  const handleCreateQuestion = () => {
    if (!newQuestionTitle.trim() || !newQuestionDescription.trim()) {
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      title: newQuestionTitle.trim(),
      description: newQuestionDescription.trim(),
      votes: 0,
      createdAt: "just now",
      orientation: newQuestionOrientation,
      username: "Usuario",
    };

    setQuestions((prev) => [newQuestion, ...prev]);
    setNewQuestionTitle("");
    setNewQuestionDescription("");
    setNewQuestionOrientation("backend");
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setNewQuestionTitle("");
    setNewQuestionDescription("");
    setNewQuestionOrientation("backend");
    setIsDialogOpen(false);
  };

  const sortedQuestions = [...questions].sort((a, b) => {
    if (sortType === "most-voted") return b.votes - a.votes;
    if (sortType === "least-voted") return a.votes - b.votes;
    return 0; // For recent, we'd need actual dates
  });

  return (
    <div className="w-3/4 mx-auto">
      <div className="flex flex-col items-center min-h-screen py-8">
        {/* Header */}
        <div className="mb-8 text-center mt-8">
          <h1 className="text-5xl font-bold text-secondary-foreground mb-4 inline-flex items-center gap-2">
            Preguntas reales de entrevistas técnicas 💬
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre y vota las preguntas más comunes en entrevistas técnicas.
            Aprende de la experiencia de otros y prepárate mejor para tu próxima
            entrevista.
          </p>
        </div>

        {/* Actions Section */}
        <div className="w-full max-w-4xl flex items-center justify-between mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="default">
                <Plus className="h-3 w-3" />
                Agregar Pregunta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Crear nueva pregunta</DialogTitle>
                <DialogDescription>
                  Comparte una pregunta técnica que hayas escuchado en
                  entrevistas o que te gustaría ver respondida.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label
                    htmlFor="title"
                    className="text-sm font-medium text-foreground"
                  >
                    Título
                  </label>
                  <Input
                    id="title"
                    placeholder="Ej: ¿Cuál es la diferencia entre var, let y const?"
                    value={newQuestionTitle}
                    onChange={(e) => setNewQuestionTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="text-sm font-medium text-foreground"
                  >
                    Descripción
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Describe más detalles sobre la pregunta, qué esperas aprender, o contexto adicional..."
                    value={newQuestionDescription}
                    onChange={(e) => setNewQuestionDescription(e.target.value)}
                    className="min-h-[120px] resize-y"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Orientación
                  </label>
                  <Tabs
                    value={newQuestionOrientation}
                    onValueChange={(v) =>
                      setNewQuestionOrientation(v as QuestionOrientation)
                    }
                  >
                    <TabsList className="w-full">
                      <TabsTrigger value="backend" className="flex-1">
                        Backend
                      </TabsTrigger>
                      <TabsTrigger value="frontend" className="flex-1">
                        Frontend
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateQuestion}
                  disabled={
                    !newQuestionTitle.trim() || !newQuestionDescription.trim()
                  }
                >
                  Guardar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Sort Filters */}
          <Tabs
            value={sortType}
            onValueChange={(v) => setSortType(v as SortType)}
          >
            <TabsList className="bg-gray-100">
              <TabsTrigger value="most-voted">🔥 Más votadas </TabsTrigger>
              <TabsTrigger value="recent">✨ Más recientes </TabsTrigger>
              <TabsTrigger value="least-voted">💔 Menos votadas </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Questions List */}
        <div className="w-full max-w-4xl space-y-4">
          {sortedQuestions.map((question) => (
            <Card
              key={question.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm py-4"
            >
              <CardContent>
                <div className="flex gap-4">
                  {/* Voting Section */}
                  <div className="flex flex-col items-center gap-1">
                    <Button
                      onClick={() => handleVote(question.id, "up")}
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "transition-colors",
                        getUserVote(question.id) === "up" &&
                          "bg-green-400 hover:bg-green-400"
                      )}
                    >
                      <ChevronUp
                        className={cn(
                          "text-gray-600",
                          getUserVote(question.id) === "up" && "text-white"
                        )}
                      />
                    </Button>
                    <span className="text-xl font-bold text-black">
                      {question.votes}
                    </span>
                    <Button
                      onClick={() => handleVote(question.id, "down")}
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "transition-colors",
                        getUserVote(question.id) === "down" &&
                          "bg-red-400 hover:bg-red-400"
                      )}
                    >
                      <ChevronDown
                        className={cn(
                          "text-gray-600",
                          getUserVote(question.id) === "down" && "text-white"
                        )}
                      />
                    </Button>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1 flex flex-col">
                    <div>
                      <h3 className="text-lg font-bold text-black mt-2 mb-2">
                        {question.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {question.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ">
                      <span className="text-xs text-gray-400">
                        {question.username}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-xs text-gray-400">
                        {question.createdAt}
                      </span>
                      <span className="text-gray-400">•</span>
                      <Badge
                        variant={
                          question.orientation === "backend"
                            ? "secondary"
                            : "default"
                        }
                        className={
                          question.orientation === "backend"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : "bg-purple-100 text-purple-800 border-purple-200"
                        }
                      >
                        {question.orientation === "backend"
                          ? "Backend"
                          : "Frontend"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
