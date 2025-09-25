'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, HelpCircle, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  hint: string
  explanation?: string
}

interface LessonQuizProps {
  questions: QuizQuestion[]
  onComplete: (quizPassed: boolean) => void
  lessonTitle: string
}

export function LessonQuiz({ questions, onComplete, lessonTitle }: LessonQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showCorrect, setShowCorrect] = useState(false)
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1))
  const [showResults, setShowResults] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)

  const currentQ = questions[currentQuestion]
  const isLastQuestion = currentQuestion === questions.length - 1
  const correctAnswers = answers.filter((answer, index) => answer === questions[index].correctAnswer).length
  const allCorrect = correctAnswers === questions.length

  const handleAnswerSelect = (answerIndex: number) => {
    // Don't allow selection if showing correct answer
    if (showCorrect) return
    
    setSelectedAnswer(answerIndex)
    // Clear hint when user selects a new answer (allows them to try again)
    if (showHint) {
      setShowHint(false)
    }
    
    // Update answers array
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return
    
    const isCorrect = selectedAnswer === currentQ.correctAnswer
    
    if (isCorrect) {
      // Show green state for correct answer
      setShowCorrect(true)
    } else {
      // Show hint for wrong answer
      setShowHint(true)
    }
  }

  const handleTryAgain = () => {
    // Reset current question state
    setSelectedAnswer(null)
    setShowHint(false)
    // Don't clear the answers array - keep track of attempts
  }

  const handleNextQuestion = () => {
    // Move to next question or show results
    if (isLastQuestion) {
      setShowResults(true)
      // Check if all answers are correct
      const updatedAnswers = [...answers]
      updatedAnswers[currentQuestion] = selectedAnswer!
      const finalCorrectAnswers = updatedAnswers.filter((answer, index) => answer === questions[index].correctAnswer).length
      
      if (finalCorrectAnswers === questions.length) {
        setQuizCompleted(true)
        onComplete(true)
      }
    } else {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowHint(false)
      setShowCorrect(false)
    }
  }

  const handleRetry = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowHint(false)
    setShowCorrect(false)
    setAnswers(new Array(questions.length).fill(-1))
    setShowResults(false)
    setQuizCompleted(false)
  }

  const getAnswerStatus = (answerIndex: number) => {
    if (selectedAnswer === null) return 'default'
    if (showResults) {
      if (answerIndex === currentQ.correctAnswer) return 'correct'
      if (answerIndex === selectedAnswer && answerIndex !== currentQ.correctAnswer) return 'incorrect'
      return 'default'
    }
    if (selectedAnswer === answerIndex) {
      if (showCorrect && answerIndex === currentQ.correctAnswer) return 'correct'
      if (showHint && answerIndex !== currentQ.correctAnswer) return 'incorrect'
      return 'selected'
    }
    return 'default'
  }

  const getButtonVariant = (status: string) => {
    switch (status) {
      case 'correct': return 'outline'
      case 'incorrect': return 'outline'
      case 'selected': return 'default'
      default: return 'outline'
    }
  }

  const getButtonClassName = (status: string) => {
    const baseClasses = 'w-full justify-start text-left p-4 h-auto transition-all duration-200'
    
    switch (status) {
      case 'correct':
        return `${baseClasses} border-green-200 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-200 hover:bg-green-50 dark:hover:bg-green-900/20`
      case 'incorrect':
        return `${baseClasses} border-red-200 bg-red-50 dark:bg-red-900/20 ring-2 ring-red-200 hover:bg-red-50 dark:hover:bg-red-900/20`
      case 'selected':
        return `${baseClasses} ring-2 ring-blue-500`
      default:
        return baseClasses
    }
  }

  if (showResults) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-2xl mx-auto">
          {!quizCompleted && (
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <HelpCircle className="h-16 w-16 text-orange-500 mx-auto" />
              </div>
              <CardTitle className="text-2xl">
                📚 Review Needed
              </CardTitle>
            </CardHeader>
          )}
          <CardContent className={`space-y-6 ${quizCompleted ? 'py-12' : ''}`}>
            <div className="text-center">
              <div className="text-2xl font-semibold mb-4">
                You got <strong>{correctAnswers}</strong> out of <strong>{questions.length}</strong> questions correct!
              </div>
              
              {quizCompleted ? (
                <div className="text-center text-muted-foreground">
                  You can now mark this lesson as complete.
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/30">
                    <HelpCircle className="h-4 w-4" />
                    <AlertDescription className="text-orange-800 dark:text-orange-200">
                      You need to get all questions correct to complete the lesson. 
                      Review the content above and try again!
                    </AlertDescription>
                  </Alert>
                  <Button onClick={handleRetry} className="w-full">
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">{currentQ.question}</h3>
            <Badge variant="outline">
              Question {currentQuestion + 1} of {questions.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            
            <div className="space-y-3">
              <AnimatePresence mode="wait">
                {currentQ.options.map((option, index) => {
                  const status = getAnswerStatus(index)
                  const variant = getButtonVariant(status)
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Button
                        variant={variant}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={false}
                        className={getButtonClassName(status)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-sm">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span>{option}</span>
                          {status === 'correct' && showResults && <CheckCircle className="h-5 w-5 ml-auto text-green-500" />}
                          {status === 'incorrect' && <XCircle className="h-5 w-5 ml-auto text-red-500" />}
                        </div>
                      </Button>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>

          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
                  <HelpCircle className="h-4 w-4" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong>Hint:</strong> {currentQ.hint}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
            {showCorrect && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <AlertDescription className="text-foreground">
                    <strong>Correct!</strong> {currentQ.explanation || 'Well done! You got the right answer.'}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (currentQuestion > 0) {
                  setCurrentQuestion(currentQuestion - 1)
                  setSelectedAnswer(answers[currentQuestion - 1] >= 0 ? answers[currentQuestion - 1] : null)
                  setShowHint(false)
                }
              }}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            <Button
              onClick={showCorrect ? handleNextQuestion : showHint ? handleTryAgain : handleSubmitAnswer}
              disabled={selectedAnswer === null && !showCorrect}
              className="min-w-32"
            >
              {showCorrect ? (isLastQuestion ? 'Finish Quiz' : 'Next Question') : showHint ? 'Try Again' : 'Submit Answer'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}