import "../styles/letterbutton.css";

const LetterButton = ({
  letter,
  redirect,
  displays,
  post,
  cnName,
  letters,
  toggleDisplay,
}) => {
  const index = letters.indexOf(letter);
  const display = displays[index];

  const toggle = () => {
    toggleDisplay(index, "toggle");
  };

  const collapse = () => {
    toggleDisplay(index, "collapse");
  };

  return (
    <div className="letter">
      <div className="letterTop">
        <button className={`lt let ${display ? "add" : ""}`} onClick={toggle}>
          {letter}
        </button>
        <button
          className={`lt col ${!display ? "cold" : ""}`}
          onClick={collapse}
        >
          Collapes All
        </button>
      </div>
      <div className="posts">
        {display &&
          post &&
          post.map((p, index) => (
            <div className="postG">
              <button className="glossaryBtns" onClick={() => redirect(p)}>
                {index + 1}.{p} <strong>{cnName[index]}</strong>
              </button>
            </div>
          ))}
      </div>
      <br />
    </div>
    // 浏览器搜索记住
  );
};
export default LetterButton;
