import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const lineSets = {
  set1: [
    "오호 통재라! 만천하 벗들에게",
    "피를 토하는 심정으로 엄히 고하노라.",
    "근래 대이화의 굳건한 기강을 뒤흔드는",
    "요망한 무리들이 창궐하니,",
    "이른바 앞에서는 백지를 주창하면서",
    "뒤로는 아산당과 이시시 구석에서",
    "전공 서책을 펼치는 참람한 뒷공부 무리로다.",
    "음흉히 뒷공부를 하는 것은",
    "곧 학업이라는 오랑캐와 화친하는 것이요",
    "달콤한 화친에 속아 몰래 책을 펴는 것은,",
    "함께 붓을 꺾기로 맹세한 벗들을 배신하고",
    "평균을 높이는 참담한 매학 행위로다.",
    "대저 학업이라 함은 우리의 평안과",
    "젊음을 갉아먹는 간악한 외세이거늘,",
    "어찌하여 입으로는 망하였다 하면서",
    "야반심경에 홀로 족보를 암송한단 말이더냐.",
    "진정 시험을 버린 자라면 마땅히 책을 불태우고",
    "조용히 재수강의 길을 걸어야 할 터.",
    "이에 본인은 위정척학의 결기로 선포하노라.",
  ],
  set2: [
    "감옥에~~~서 누가 돌아왔~~~게",
    "혹시... 자기야? 드디어 출소한 거야?",
    "그래!!! 검은 흑곰이 돌아왔다",
    "자기야... 너무 보고싶었어...",
    "16년간 단 하루도 자기를 잊은 적이 없어.",
    "피로 네 얼굴을 매일같이 그렸지.",
    "맞아, 자긴 끔찍한 범죄를 저질렀지.",
    "키 2미터 13센치에 몸무게 200키로를 건드린 죄지.",
    "역시 나만의 야만인이야.",
    "지금 어디야!!!",
    "이제 택시 타고 집 가는 중.",
    "그래그래그래!!!",
    "근데, 집 가는 방향이 아닌...",
    "기사님 바꿔!!!",
    "이제 일반인은 해치지 않기로 했잖아!!",
    "그래그래, 그래그래...",
    "또 감옥에 가고 싶은 거야?",
    "약속했었지...",
    "그래도 걱정해주니까 좋다 ㅎㅎ",
    "단 하나만 기억해.",
    "검은 흑곰은 피에 굶주려 있다는 사실을.",
  ],
  set3: [
    "아이들은 누구나 마음 속에 알을 가지고 있다",
    "charac charac change!",
    "charac charac change!",
    "another character go for you~",
    "있는 그대로 나의 모습을 보여주는 게 싫었어",
    "하늘의 작은 별들도 제 빛을 비추는데",
    "날 몰라줘도 날 오해해도 언젠간 날 보여줄게",
    "널 사랑해도 말 못했던 나",
    "달라질게 솔직한 날 기대해",
    "I can change the charac and motion",
    "내가 가진 또 다른 모습",
    "숨겨왔었던 모든 내 사랑들을",
    "이젠 보여줄 수 있는 걸",
    "I can feel the Happy emotion",
    "내가 또 다른 사랑인 거야",
    "나를 가렸던 기억 이젠 모두 다 바꿔줘",
    "charac charac change!",
    "행복하도록",
  ],
};

// 한글 분해 로직
const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

function splitString(str) {
  if (!str) return [];
  return str.split("").flatMap(c => {
    const code = c.charCodeAt(0);
    if (code < 0xac00 || code > 0xd7a3) return [c];
    const n = code - 0xac00;
    const res = [CHO[Math.floor(n / 588)], JUNG[Math.floor((n % 588) / 28)]];
    const jong = n % 28;
    if (JONG[jong]) res.push(JONG[jong]);
    return res;
  });
}

function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const { studentId, name, group, setId } =
    location.state || { studentId: "", name: "none", group: "none", setId: "set1" };
  const lines = lineSets[setId] || lineSets.set1;

  const [currentLine, setCurrentLine] = useState(0);
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [finalElapsed, setFinalElapsed] = useState(0);

  const [accJamoCount, setAccJamoCount] = useState(0);
  const [accErrors, setAccErrors] = useState(0);

  const [speed, setSpeed] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  const [myRank, setMyRank] = useState("-");
  const [isNewBest, setIsNewBest] = useState(true);
  const [bestScore, setBestScore] = useState(0);

  const inputRef = useRef(null);
  const isComposingRef = useRef(false);

  const setNames = {
    set1: "척학비", set2: "흑곰", set3: "캐캐체"
  }

  // -----------------------------
  // 학번 기준 "최고 기록만 유지" 저장 함수
  // -----------------------------
  const saveOrUpdateBestScore = async (rawSpeed, finalAcc) => {
    const adjustedScore = Math.round(rawSpeed * Math.pow(finalAcc / 100, 1.3));

    try {
      const q = query(
        collection(db, "rankings"),
        where("studentId", "==", studentId),
        where("setId", "==", setId)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        await addDoc(collection(db, "rankings"), {
          studentId,
          name: name || "익명",
          group: group || "무소속",
          speed: Math.round(rawSpeed),
          accuracy: Number(finalAcc.toFixed(1)),
          score: adjustedScore,
          setId: setId || "set1",
          timestamp: serverTimestamp(),
        });
        console.log("스코어 저장 완료 (신규)");
        return { isNewBest: true, bestScore: adjustedScore };
      }

      const existingDoc = snap.docs[0];
      const existingScore = existingDoc.data().score || 0;

      if (adjustedScore > existingScore) {
        await updateDoc(doc(db, "rankings", existingDoc.id), {
          name: name || "익명",
          group: group || "무소속",
          speed: Math.round(rawSpeed),
          accuracy: Number(finalAcc.toFixed(1)),
          score: adjustedScore,
          timestamp: serverTimestamp(),
        });
        console.log("스코어 저장 완료 (갱신)");
        return { isNewBest: true, bestScore: adjustedScore };
      }

      console.log("기존 최고 기록 유지 (이번 기록이 더 낮음)");
      return { isNewBest: false, bestScore: existingScore };
    } catch (error) {
      console.error("스코어 저장 오류:", error);
      return { isNewBest: false, bestScore: 0 };
    }
  };

  // -----------------------------
  // 메트릭 계산 함수
  // -----------------------------
  const updateMetrics = (currentInput) => {
    if (!startTime) return;

    const now = Date.now();
    const elapsed = (now - startTime) / 1000;
    const minutes = Math.max(elapsed / 60, 0.001);

    const currentInputJamo = splitString(currentInput);
    const currentTargetJamo = splitString(lines[currentLine] || "");

    let currentLineErrors = 0;
    currentInputJamo.forEach((jamo, i) => {
      if (jamo !== currentTargetJamo[i]) currentLineErrors++;
    });

    const totalJamo = accJamoCount + currentInputJamo.length;
    const totalErrors = accErrors + currentLineErrors;

    const spd = totalJamo / minutes;
    const acc = totalJamo === 0 ? 100 : ((totalJamo - totalErrors) / totalJamo) * 100;

    setSpeed(spd);
    setAccuracy(acc);
  };

  const calculateRank = async (scoreForRank, finalAcc) => {
    if (finalAcc < 60) {
      setMyRank("-");
      return;
    }

    try {
      const q = query(
        collection(db, "rankings"),
        where("setId", "==", setId)
      );

      const querySnapshot = await getDocs(q);
      const allRankings = querySnapshot.docs.map(doc => doc.data());

      const higherCount = allRankings.filter(r => (r.score || 0) > scoreForRank).length;

      setMyRank(higherCount + 1);
    } catch (e) {
      console.error("등수 계산 오류:", e);
      setMyRank("-");
    }
  };

  // -----------------------------
  // 이벤트 핸들러
  // -----------------------------
  const preventCopyPaste = (e) => {
    e.preventDefault();
    alert("복붙 금지! 직접 입력해 주세요.");
  };

  const handleInputChange = (e) => {
    if (isFinished) return;
    const val = e.target.value;

    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    setInput(val);
    updateMetrics(val);
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };
  const handleCompositionEnd = () => {
    setTimeout(() => {
      isComposingRef.current = false;
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;

    if (e.nativeEvent.isComposing || isComposingRef.current || e.keyCode === 229) {
      return;
    }

    e.preventDefault();

    if (input.trim().length === 0) {
      return;
    }

    const currentTargetJamo = splitString(lines[currentLine] || "");
    const currentInputJamo = splitString(input);

    let lineErrors = 0;
    const maxLength = Math.max(currentTargetJamo.length, currentInputJamo.length);
    for (let i = 0; i < maxLength; i++) {
      if (currentInputJamo[i] !== currentTargetJamo[i]) {
        lineErrors++;
      }
    }

    const nextJamoCount = accJamoCount + currentInputJamo.length;
    const nextErrors = accErrors + lineErrors;

    if (currentLine === lines.length - 1) {
      const endTime = Date.now();
      const totalTimeSeconds = (endTime - (startTime || endTime)) / 1000;
      setFinalElapsed(totalTimeSeconds);

      const finalMinutes = Math.max(totalTimeSeconds / 60, 0.001);
      const rawSpeed = nextJamoCount / finalMinutes;
      const finalAcc = ((nextJamoCount - nextErrors) / nextJamoCount) * 100;

      setSpeed(rawSpeed);
      setAccuracy(finalAcc);
      setIsFinished(true);

      saveOrUpdateBestScore(rawSpeed, finalAcc).then(({ isNewBest: newBest, bestScore: best }) => {
        setIsNewBest(newBest);
        setBestScore(best);
        calculateRank(best, finalAcc);
      });
    } else {
      setAccJamoCount(nextJamoCount);
      setAccErrors(nextErrors);
      setCurrentLine(prev => prev + 1);
      setInput("");
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return m > 0 ? `${m}분 ${s}초` : `${s}초`;
  };

  const renderTargetLine = () => {
    const targetText = lines[currentLine] || "";
    return targetText.split("").map((char, i) => {
      let color = (input[i] !== undefined && input[i] === char) ? "#c36fff" : "black";
      return <span key={i} style={{ color }}>{char}</span>;
    });
  };

  const renderFakeInput = () => {
    const targetText = lines[currentLine] || "";
    return input.split("").map((char, i) => {
      const isWrong = targetText[i] !== undefined && char !== targetText[i];
      return <span key={i} style={{ color: isWrong ? "red" : "black" }}>{char}</span>;
    });
  };

  return (
    <div style={styles.container} onClick={() => inputRef.current?.focus()}>
      <div style={styles.userInfo}>{studentId} · {name} / {group}</div>

      <div style={styles.gameBox}>
        <div style={styles.lineProgress}>{currentLine + 1}/{lines.length}</div>
        <div style={styles.subBox}>{lines[currentLine - 1] || ""}</div>
        <div style={styles.mainBox}>{renderTargetLine()}</div>
        <div style={styles.subBox}>{lines[currentLine + 1] || ""}</div>
        <div style={styles.subBox}>{lines[currentLine + 2] || ""}</div>

        <div style={styles.inputContainer}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onPaste={preventCopyPaste}
            onContextMenu={(e) => e.preventDefault()}
            style={styles.hiddenInput}
            autoFocus
          />
          <div style={styles.fakeInput}>
            {renderFakeInput()}
            {!isFinished && <span className="cursor" style={styles.cursor}>|</span>}
          </div>
        </div>

        <div style={styles.metrics}>
          <span>평균 타수: {Math.round(speed)}</span>
          <span style={{ marginLeft: "30px" }}>정확도: {accuracy.toFixed(1)}%</span>
        </div>
      </div>

      {isFinished && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={{ textAlign: 'center', fontFamily: 'Galmuri11' }}>게임 종료</h2>
            <div style={styles.resultRow}><span>학번</span> <b>{studentId}</b></div>
            <div style={styles.resultRow}><span>아이디</span> <b>{name}</b></div>
            <div style={styles.resultRow}><span>소속 학과</span> <b>{group}</b></div>
            <div style={styles.resultRow}><span>이번 기록 타수</span> <b style={{ color: '#c36fff' }}>{Math.round(speed)}</b></div>
            <div style={styles.resultRow}><span>이번 기록 정확도</span> <b style={{ color: '#c36fff' }}>{accuracy.toFixed(1)}%</b></div>
            <div style={styles.resultRow}><span>소요 시간</span> <b style={{ color: 'black' }}>{formatTime(finalElapsed)}</b></div>
            <div style={styles.resultRow}> <span>세트</span> <b>{setNames[setId] || "세트명"}</b> </div>
            <div style={styles.resultRow}><span>내 최고 점수</span> <b>{bestScore}</b></div>
            {!isNewBest && (
              <div style={styles.noticeRow}>이전 최고 기록이 더 높아 랭킹은 갱신되지 않았어요</div>
            )}
            <div style={styles.rankHighlight}><span>내 순위</span><b>{myRank} 위</b></div>
            <div style={styles.btnGroup}>
              <button onClick={() => window.location.reload()} style={{ ...styles.btn, fontFamily: 'Galmuri11' }}>다시 하기</button>
              <button onClick={() => navigate("/")} style={{ ...styles.btn, fontFamily: 'Galmuri11', backgroundColor: "#6c757d" }}>홈</button>
              <button onClick={() => navigate("/scoreboard")} style={{ ...styles.btn, fontFamily: 'Galmuri11', backgroundColor: "#c36fff" }}>스코어보드</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink { 0% {opacity:0} 50% {opacity:1} 100% {opacity:0} }
        .cursor { animation: blink 1s infinite; }
      `}</style>

      <Footer />
    </div>
  );
}

const styles = {
  container: {
    padding: "60px 20px", fontFamily: "Galmuri11", backgroundColor: "#f0f2f5", minHeight: "100vh",
    backgroundImage: "url('/images/bg2.png')",
    backgroundSize: 'cover', backgroundPosition: 'center', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'
  },
  userInfo: { position: "absolute", top: 20, right: 20, fontSize: "14px", color: "#888", backgroundColor: "white", padding: '0px 10px' },
  gameBox: { position: "relative", marginTop: "130px", maxWidth: "800px", margin: "0 auto", textAlign: "center", backgroundColor: "white", padding: "50px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" },
  lineProgress: { position: "absolute", top: "20px", right: "30px", fontSize: "16px", fontWeight: "bold", color: "#888", fontFamily: "Galmuri11" },
  subBox: { height: "30px", fontSize: "18px", color: "#ddd", margin: "10px 0" },
  mainBox: { fontSize: "32px", fontWeight: "bold", margin: "25px 0", minHeight: "45px", letterSpacing: "1px" },
  inputContainer: {
    position: "relative", width: "90%", margin: "0 auto", height: "55px", border: "2px solid #eee", borderRadius: "10px", display: "flex", alignItems: "center", overflow: "hidden",
    backgroundImage: "url('/images/input.png')", backgroundSize: "cover",
    backgroundPosition: "center",
  },
  hiddenInput: { position: "absolute", width: "100%", height: "100%", opacity: 0, zIndex: 2, cursor: "text", border: "none", outline: "none" },
  fakeInput: { padding: "0 15px", fontSize: "22px", textAlign: "left", width: "100%", whiteSpace: "pre", pointerEvents: "none" },
  cursor: { color: "#007bff", fontWeight: "bold", marginLeft: "2px" },
  metrics: { marginTop: "40px", fontSize: "20px", fontWeight: "600", color: "#555" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { backgroundColor: "white", padding: "40px", borderRadius: "20px", width: "320px", boxShadow: "0 20px 40px rgba(0,0,0,0.3)", fontFamily: 'Galmuri9' },
  resultRow: { display: "flex", justifyContent: "space-between", margin: "15px 0", fontSize: "18px", borderBottom: "1px solid #f5f5f5", paddingBottom: "5px" },
  noticeRow: { fontSize: "13px", color: "#e53935", textAlign: "center", margin: "10px 0" },
  btnGroup: { display: "flex", gap: "10px", marginTop: "20px", fontFamily: 'Galmuri11' },
  btn: { flex: 1, padding: "12px", backgroundColor: "#c36fff", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
  rankHighlight: {
    backgroundColor: "#fff176", padding: "5px",
    display: "flex", justifyContent: "space-between", margin: "10px 0", fontSize: "18px", borderBottom: "1px solid #f5f5f5",
  },
};

export default Game;