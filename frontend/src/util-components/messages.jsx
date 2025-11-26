import { useMessagesContext } from "../application-context/messages-context.jsx";

export default function Messages() {
  const { errorMessage, successMessage, loadingMessage, resetMessages } = useMessagesContext();

  return (
    <div className="alert-container">
      {errorMessage && (
        <div
          className="alert alert-danger my-2 alert-positioning d-flex align-items-center"
          style={{ whiteSpace: "pre-line" }}
          onClick={(e) => {
            e.stopPropagation();
            resetMessages();
          }}
        >
          {errorMessage}
          <button className="ms-auto btn btn-link link-no-decorations p-0">
            <h4 aria-hidden="true">&times;</h4>
          </button>
        </div>
      )}
      {successMessage && (
        <div
          className="alert alert-success my-2 alert-positioning d-flex align-items-center"
          style={{ whiteSpace: "pre-line" }}
          onClick={(e) => {
            e.stopPropagation();
            resetMessages();
          }}
        >
          {successMessage}
          <button className="ms-auto btn btn-link link-no-decorations p-0">
            <h4 aria-hidden="true">&times;</h4>
          </button>
        </div>
      )}
      {loadingMessage && (
        <div
          className="alert alert-secondary my-2 alert-positioning d-flex align-items-center"
          style={{ whiteSpace: "pre-line" }}
          onClick={(e) => {
            e.stopPropagation();
            resetMessages();
          }}
        >
          {loadingMessage}
          <button className="ms-auto btn btn-link link-no-decorations p-0">
            <h4 aria-hidden="true">&times;</h4>
          </button>
        </div>
      )}
    </div>
  );
}

