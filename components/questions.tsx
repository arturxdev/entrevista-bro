"use client";
import { useState, useEffect } from "react";
import { MessageCircle, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { useUser, SignedIn, SignedOut } from "@clerk/nextjs";
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
  likes: number;
  dislikes: number;
  createdAt: string;
  orientation: QuestionOrientation;
  username: string;
  userVote?: "like" | "dislike" | null;
};

export function QuestionsSection() {
  const { user } = useUser();
  const [sortType, setSortType] = useState<SortType>("most-voted");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Map<string, "like" | "dislike">>(
    new Map()
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionDescription, setNewQuestionDescription] = useState("");
  const [newQuestionOrientation, setNewQuestionOrientation] =
    useState<QuestionOrientation>("backend");

  const handleVote = async (questionId: string, direction: "up" | "down") => {
    if (!user) {
      alert("Debes iniciar sesión para votar");
      return;
    }

    const voteType = direction === "up" ? "like" : "dislike";

    try {
      const response = await fetch(`/api/questions/${questionId}/vote`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voteType }),
      });

      if (response.ok) {
        const result = await response.json();

        // Actualizar el estado local
        setQuestions((prev) =>
          prev.map((q) => {
            if (q.id !== questionId) return q;

            const updatedQuestion = {
              ...q,
              likes: result.likes,
              dislikes: result.dislikes,
              votes: result.votes,
              userVote: result.userVote || null,
            };

            // Actualizar la pregunta seleccionada si es la que se está votando
            if (selectedQuestion?.id === questionId) {
              setSelectedQuestion(updatedQuestion);
            }

            return updatedQuestion;
          })
        );

        // Actualizar el estado del voto del usuario
        setUserVotes((prev) => {
          const newMap = new Map(prev);
          if (result.userVote) {
            newMap.set(questionId, result.userVote as "like" | "dislike");
          } else {
            newMap.delete(questionId);
          }
          return newMap;
        });
      } else {
        const error = await response.json();
        alert(error.error || "Error al votar");
      }
    } catch (error) {
      console.error("Error voting:", error);
      alert("Error al votar");
    }
  };

  const getUserVote = (questionId: string): "up" | "down" | null => {
    const vote = userVotes.get(questionId);
    if (vote === "like") return "up";
    if (vote === "dislike") return "down";
    return null;
  };

  const handleQuestionClick = (question: Question) => {
    setSelectedQuestion(question);
    setIsViewDialogOpen(true);
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("/api/questions");
        if (response.ok) {
          const data = await response.json();
          // Formatear las fechas para mostrar
          const formattedQuestions = data.map((q: any) => ({
            ...q,
            likes: q.likes || 0,
            dislikes: q.dislikes || 0,
            votes: q.votes || 0,
            userVote: q.userVote || null,
            createdAt: formatDate(q.createdAt),
          }));
          setQuestions(formattedQuestions);

          // Cargar los votos del usuario en el estado local
          if (user) {
            const votesMap = new Map<string, "like" | "dislike">();
            formattedQuestions.forEach((q: Question) => {
              if (q.userVote) {
                votesMap.set(q.id, q.userVote);
              }
            });
            setUserVotes(votesMap);
          }
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [user]);

  const formatDate = (dateString: string | Date): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleCreateQuestion = async () => {
    if (!newQuestionTitle.trim() || !newQuestionDescription.trim()) {
      return;
    }

    if (!user) {
      alert("Debes iniciar sesión para crear una pregunta");
      return;
    }

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newQuestionTitle.trim(),
          description: newQuestionDescription.trim(),
          orientation: newQuestionOrientation,
          username:
            user.fullName ||
            user.firstName ||
            user.emailAddresses[0]?.emailAddress ||
            "Usuario",
        }),
      });

      if (response.ok) {
        const newQuestion = await response.json();
        const formattedQuestion = {
          ...newQuestion,
          createdAt: formatDate(newQuestion.createdAt),
        };
        setQuestions((prev) => [formattedQuestion, ...prev]);
        setNewQuestionTitle("");
        setNewQuestionDescription("");
        setNewQuestionOrientation("backend");
        setIsDialogOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || "Error al crear la pregunta");
      }
    } catch (error) {
      console.error("Error creating question:", error);
      alert("Error al crear la pregunta");
    }
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
            <SignedIn>
              <DialogTrigger asChild>
                <Button size="default">
                  <Plus className="h-3 w-3" />
                  Agregar Pregunta
                </Button>
              </DialogTrigger>
            </SignedIn>
            <SignedOut>
              <Button
                size="default"
                disabled
                title="Inicia sesión para agregar una pregunta"
              >
                <Plus className="h-3 w-3" />
                Agregar Pregunta
              </Button>
            </SignedOut>
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
                    id="Describe tu experiencia"
                    placeholder="Describe más detalles sobre la pregunta como te la preguntaron, que respondiste etc"
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
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando preguntas...
            </div>
          ) : sortedQuestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay preguntas aún. ¡Sé el primero en crear una!
            </div>
          ) : (
            sortedQuestions.map((question) => (
              <Card
                key={question.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm py-4"
              >
                <CardContent>
                  <div className="flex gap-4">
                    {/* Voting Section */}
                    <div
                      className="flex flex-col items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
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
                    <div
                      className="flex-1 flex flex-col cursor-pointer"
                      onClick={() => handleQuestionClick(question)}
                    >
                      <div>
                        <h3 className="text-lg font-bold text-black mt-2 mb-2 hover:text-blue-600 transition-colors">
                          {question.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
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
            ))
          )}
        </div>
      </div>

      {/* View Question Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedQuestion?.title}
            </DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-400">
                  {selectedQuestion?.username}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-xs text-gray-400">
                  {selectedQuestion?.createdAt}
                </span>
                <span className="text-gray-400">•</span>
                <Badge
                  variant={
                    selectedQuestion?.orientation === "backend"
                      ? "secondary"
                      : "default"
                  }
                  className={
                    selectedQuestion?.orientation === "backend"
                      ? "bg-blue-100 text-blue-800 border-blue-200"
                      : "bg-purple-100 text-purple-800 border-purple-200"
                  }
                >
                  {selectedQuestion?.orientation === "backend"
                    ? "Backend"
                    : "Frontend"}
                </Badge>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {selectedQuestion?.description}
              </p>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedQuestion?.likes || 0} likes •{" "}
                {selectedQuestion?.dislikes || 0} dislikes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() =>
                  selectedQuestion && handleVote(selectedQuestion.id, "up")
                }
                variant="ghost"
                className={cn(
                  selectedQuestion &&
                    getUserVote(selectedQuestion.id) === "up" &&
                    "bg-green-500 hover:bg-green-600 text-white"
                )}
              >
                <ChevronUp />
                Like
              </Button>
              <Button
                onClick={() =>
                  selectedQuestion && handleVote(selectedQuestion.id, "down")
                }
                variant="ghost"
                className={cn(
                  selectedQuestion &&
                    getUserVote(selectedQuestion.id) === "down" &&
                    "bg-red-500 hover:bg-red-600 text-white"
                )}
              >
                <ChevronDown />
                Dislike
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Cerrar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
