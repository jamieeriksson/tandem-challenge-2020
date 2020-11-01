import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

class TriviaAnswer extends React.Component {
  render() {
    const answer = this.props.answer;
    const correctAnswer = this.props.correctAnswer;
    const selectedAnswer = this.props.selectedAnswer;
    const answerIsSubmit = this.props.answerIsSubmit;

    if (answer == correctAnswer) {
      return (
        <label className="text-2xl flex place-items-center">
          <input
            name="triviaAnswer"
            type="radio"
            id={answer}
            value={answer}
            checked={selectedAnswer === answer}
            onChange={this.props.handleChange}
            className="mr-4"
          />
          <span>{answer}</span>
          <FontAwesomeIcon
            icon={faCheck}
            size="2x"
            color="#26AC1B"
            className={`ml-6 ${answerIsSubmit ? "inline" : "hidden"}`}
          />
        </label>
      );
    } else {
      return (
        <label className="text-2xl flex place-items-center">
          <input
            name="triviaAnswer"
            type="radio"
            id={answer}
            value={answer}
            checked={selectedAnswer === answer}
            onChange={this.props.handleChange}
            className="mr-4"
          />
          <span>{answer}</span>
          <FontAwesomeIcon
            icon={faTimes}
            size="2x"
            color="#CF5C36"
            className={`ml-6 ${answerIsSubmit ? "inline" : "hidden"}`}
          />
        </label>
      );
    }
  }
}

class Timer extends React.Component {
  componentDidMount() {
    this.timerID = setInterval(() => this.props.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  render() {
    const { minutes, seconds } = this.props;
    const duration = minutes * 60 + seconds;

    return (
      <div className="flex flex-col">
        <p className="self-end font-cursive text-2xl">
          Time Remaining: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </p>
        <div className="relative h-4 w-full">
          <div className="absolute bg-white shadow-md h-4 w-full"></div>
          <div className="absolute bg-blue-dark h-4 w-full animate-timer origin-left"></div>
        </div>
      </div>
    );
  }
}

class TriviaQuiz extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      triviaItems: [],
      askedQuestionIds: [],
      currentQuestion: "",
      currentAnswers: [],
      correctAnswer: "",
      selectedAnswer: "",
      answerIsSubmit: false,
      submitMessage: "",
      minutes: 0,
      seconds: 10,
      totalPoints: 0,
    };

    this.getNewTriviaQuestion = this.getNewTriviaQuestion.bind(this);
    this.handleNextQuestionClick = this.handleNextQuestionClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleTimerEnd = this.handleTimerEnd.bind(this);
    this.tick = this.tick.bind(this);
  }

  async componentDidMount() {
    this._isMounted = true;

    try {
      const response = await fetch("http://localhost:4444/quiz");
      if (!response.ok) {
        throw Error(response.statusText);
      }
      const json = await response.json();
      if (this._isMounted) {
        this.setState({
          isLoaded: true,
          triviaItems: json.items,
        });
        this.getNewTriviaQuestion();
      }
    } catch (error) {
      console.log(error);
      this.setState({
        isLoaded: true,
        error,
      });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getNewTriviaQuestion() {
    const triviaItems = this.state.triviaItems;
    let askedQuestionIds = this.state.askedQuestionIds;
    let newAnswers = [];
    let newQuestion = "";

    do {
      newQuestion = triviaItems[Math.floor(Math.random() * triviaItems.length)];
      console.log(newQuestion);
    } while (askedQuestionIds.includes(newQuestion.id));

    askedQuestionIds = askedQuestionIds.concat(newQuestion.id);
    newAnswers = newQuestion.incorrect;
    newAnswers = newAnswers.concat(newQuestion.correct);
    console.log(newAnswers);

    // Randomize answer order with Fisher-Yates Algorithm
    for (let i = newAnswers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i);
      const temp = newAnswers[i];
      newAnswers[i] = newAnswers[j];
      newAnswers[j] = temp;
    }

    this.setState({
      askedQuestionIds: askedQuestionIds,
      currentQuestion: newQuestion.question,
      currentAnswers: newAnswers,
      correctAnswer: newQuestion.correct,
      submitMessage: "",
      selectedAnswer: "",
      resetTimer: true,
    });
  }

  handleNextQuestionClick(e) {
    e.preventDefault();
    this.getNewTriviaQuestion();
    this.setState({
      answerIsSubmit: false,
      minutes: 0,
      seconds: 10,
    });
  }

  handleChange(e) {
    this.setState({
      selectedAnswer: e.target.value,
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const selectedAnswer = this.state.selectedAnswer;
    const correctAnswer = this.state.correctAnswer;
    const totalPoints = this.state.totalPoints;

    if (!selectedAnswer) {
      this.setState({
        submitMessage: "Please select an answer before submitting.",
      });
    } else if (selectedAnswer == correctAnswer) {
      this.setState({
        submitMessage: "You answered correctly!",
        answerIsSubmit: true,
        minutes: 0,
        seconds: 0,
        totalPoints: totalPoints + 10,
      });
    } else if (selectedAnswer != correctAnswer) {
      this.setState({
        submitMessage: "You answered incorrectly.",
        answerIsSubmit: true,
        minutes: 0,
        seconds: 0,
      });
    }
  }

  // Timer methods
  handleTimerEnd() {
    this.setState({
      submitMessage: "Your time ran out to answer.",
      answerIsSubmit: true,
    });
  }

  tick() {
    let minutes = this.state.minutes;
    let seconds = this.state.seconds;
    const answerIsSubmit = this.state.answerIsSubmit;

    if (answerIsSubmit === false) {
      if (minutes === 0 && seconds === 0) {
        this.handleTimerEnd();
      } else if (seconds === 0) {
        seconds = 59;
        minutes = minutes - 1;
      } else {
        seconds = seconds - 1;
      }
    } else {
      minutes = 0;
      seconds = 0;
    }

    this.setState({
      minutes: minutes,
      seconds: seconds,
    });
  }

  render() {
    const {
      error,
      isLoaded,
      triviaItems,
      askedQuestionIds,
      currentQuestion,
      currentAnswers,
      answerIsSubmit,
      submitMessage,
      correctAnswer,
      minutes,
      seconds,
      totalPoints,
    } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <div className="bg-blue-light w-screen h-screen flex justify-center place-items-center">
          <div className="max-w-6xl w-full py-4 px-6 bg-gray-light rounded-xl flex flex-col">
            <p className="font-cursive text-2xl">
              Question {askedQuestionIds.length}/{triviaItems.length}
            </p>
            <div>
              <Timer
                handleTimerEnd={this.handleTimerEnd}
                tick={this.tick}
                minutes={minutes}
                seconds={seconds}
              />
            </div>
            <div className="font-sans w-full mt-10">
              <h2 className="text-3xl text-center">{currentQuestion}</h2>
              <form className="flex flex-col">
                <div className="self-center max-w-3xl w-full my-4 p-4 grid grid-cols-2 grid-rows-2 gap-6">
                  {currentAnswers.map((answer) => (
                    <TriviaAnswer
                      answer={answer}
                      correctAnswer={correctAnswer}
                      selectedAnswer={this.state.selectedAnswer}
                      handleChange={this.handleChange}
                      answerIsSubmit={answerIsSubmit}
                    />
                  ))}
                </div>
                <p
                  className={`self-center font-cursive text-2xl ${
                    this.state.selectedAnswer == this.state.correctAnswer
                      ? "text-green"
                      : "text-red"
                  }`}
                >
                  {submitMessage}
                </p>
                <div className="flex flex-row w-full justify-start">
                  <p className="flex-grow font-cursive text-2xl">
                    Total Points: {totalPoints}
                  </p>
                  <input
                    type="submit"
                    value="Submit Answer"
                    onClick={this.handleSubmit}
                    className={`px-4 py-1 bg-red font-capital text-2xl text-white rounded-md ${
                      answerIsSubmit ? "hidden" : "block"
                    } focus:outline-none`}
                  />
                  <button
                    onClick={this.handleNextQuestionClick}
                    className={`pl-4 pr-3 py-1  bg-blue-dark font-capital text-2xl text-white rounded-md ${
                      answerIsSubmit ? "block" : "hidden"
                    } focus:outline-none`}
                  >
                    Next Question
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      color="#FBFBFF"
                      className="ml-2"
                    />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default TriviaQuiz;
