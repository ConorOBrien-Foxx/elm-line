port module Interact exposing (..)

type alias Input = String
type alias Output = String

port get : (Input -> msg) -> Sub msg
port put : Output -> Cmd msg

type alias Interactor = Program Flags Model Msg

type alias Model =
  { parseLine : (String -> String)
  }

type Msg
  = Input String

type alias Flags
  = ()

onLines : (String -> String) -> Interactor
onLines fn = Platform.worker
  { init = init fn
  , update = update
  , subscriptions = subscriptions
  }

init : (String -> String) -> Flags -> ( Model, Cmd Msg )
init fn _ =
  ( { parseLine = fn }
  , Cmd.none
  )

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
  case msg of
    Input input ->
      ( model, input |> model.parseLine |> put )

subscriptions : Model -> Sub Msg
subscriptions _ =
  get Input

-- derived helpers
maybeOn : String -> (String -> Maybe a) -> (a -> String) -> (a -> a) -> Interactor
maybeOn descriptor fromString toString fn =
  onLines (\line ->
    case fromString line of
      Just entry ->
        entry |> fn |> toString
      
      Nothing ->
        "Error: Cannot parse " ++ line ++ " as " ++ descriptor ++ "!"
  )

onInts : (Int -> Int) -> Interactor
onInts = maybeOn
  "Int"
  (String.trim >> String.toInt)
  String.fromInt
