import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { db } from "../firebase";
import {
  collection,
  query,
  onSnapshot,
  where
} from "firebase/firestore";

function Scoreboard() {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [currentTab, setCurrentTab] = useState("set1");
  const [viewMode, setViewMode] = useState("individual"); // "individual" | "department"

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "-";
    try {
      const date = timestamp.toDate();

      const KST_OFFSET = 9 * 60 * 60 * 1000;
      const kstDate = new Date(date.getTime() + KST_OFFSET);

      const y = kstDate.getUTCFullYear();
      const m = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
      const d = String(kstDate.getUTCDate()).padStart(2, '0');
      const h = String(kstDate.getUTCHours()).padStart(2, '0');
      const min = String(kstDate.getUTCMinutes()).padStart(2, '0');
      return `${y}.${m}.${d} ${h}:${min}`;
    } catch (e) {
      return "-";
    }
  };

  useEffect(() => {
    setRankings([]);

    // rankings 컬렉션은 학번당 최고 기록 1건만 존재하므로 중복 제거가 따로 필요 없습니다.
    const q = query(
      collection(db, "rankings"),
      where("setId", "==", currentTab)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sortedData = data.sort((a, b) => (b.score || 0) - (a.score || 0));
      setRankings(sortedData);
    });

    return () => unsubscribe();
  }, [currentTab]);

  // 학과별 평균 점수 집계 (현재 선택된 세트 기준)
  const departmentStats = (() => {
    const groups = {};
    rankings.forEach((r) => {
      const groupName = r.group || "무소속";
      if (!groups[groupName]) {
        groups[groupName] = { group: groupName, totalScore: 0, totalAccuracy: 0, count: 0 };
      }
      groups[groupName].totalScore += r.score || 0;
      groups[groupName].totalAccuracy += r.accuracy || 0;
      groups[groupName].count += 1;
    });

    return Object.values(groups)
      .map((g) => ({
        group: g.group,
        avgScore: g.totalScore / g.count,
        avgAccuracy: g.totalAccuracy / g.count,
        count: g.count,
      }))
      .sort((a, b) => b.avgScore - a.avgScore);
  })();

  return (
    <div style={styles.container}>
      <div style={styles.titleImgContainer}>
        <img src="/images/title.png" alt="타이틀" style={styles.titleImg} />
      </div>

      <h1 style={styles.title}>
        <img src='/images/rankings.png' alt="랭킹-타이틀" style={styles.rankImg} />
      </h1>

      <div style={styles.topBtnGroup}>
        <button
          onClick={() => setCurrentTab("set1")}
          style={currentTab === "set1" ? styles.activeTab : styles.tab}
        >캐캐체</button>
        <button
          onClick={() => setCurrentTab("set2")}
          style={currentTab === "set2" ? styles.activeTab : styles.tab}
        >안전귀가</button>
        <button
          onClick={() => setCurrentTab("set3")}
          style={currentTab === "set3" ? styles.activeTab : styles.tab}
        >척학비</button>
        <button
          onClick={() => navigate("/")}
          style={styles.homeTabBtn}
        >홈으로</button>
      </div>

      <div style={styles.viewModeGroup}>
        <button
          onClick={() => setViewMode("individual")}
          style={viewMode === "individual" ? styles.activeModeBtn : styles.modeBtn}
        >개인 랭킹</button>
        <button
          onClick={() => setViewMode("department")}
          style={viewMode === "department" ? styles.activeModeBtn : styles.modeBtn}
        >학과별 랭킹</button>
      </div>

      {viewMode === "individual" ? (
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th>순위</th>
              <th>아이디</th>
              <th>소속 학과</th>
              <th>타수</th>
              <th>정확도</th>
              <th>기록 일시</th>
            </tr>
          </thead>

          <tbody>
            {rankings.map((r, i) => {
              const isValidScore = (r.accuracy >= 60) && (r.speed > 0);

              return (
                <tr
                  key={r.id}
                  style={{
                    ...styles.tr,
                    ...(i === 0 && isValidScore ? styles.first : {})
                  }}>
                  <td>{isValidScore ? i + 1 : "-"}</td>
                  <td>{r.name || "익명"}</td>
                  <td>{r.group || "무소속"}</td>
                  <td>{Math.round(r.speed || 0)}</td>
                  <td>{r.accuracy ? r.accuracy.toFixed(1) : "0.0"}%</td>
                  <td style={styles.timeCell}>{formatDateTime(r.timestamp)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th>순위</th>
              <th>학과</th>
              <th>평균 점수</th>
              <th>참여 인원</th>
            </tr>
          </thead>
          <tbody>
            {departmentStats.map((d, i) => (
              <tr key={d.group} style={{ ...styles.tr, ...(i === 0 ? styles.first : {}) }}>
                <td>{i + 1}</td>
                <td>{d.group}</td>
                <td>{Math.round(d.avgScore)}</td>
                <td>{d.count}명</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {viewMode === "individual" && rankings.length === 0 && (
        <p style={{ marginTop: "20px", color: "#888" }}>아직 기록이 없습니다.</p>
      )}
      {viewMode === "department" && departmentStats.length === 0 && (
        <p style={{ marginTop: "20px", color: "#888" }}>아직 기록이 없습니다.</p>
      )}
      <Footer />
    </div>
  );
}

const styles = {
  pageWrapper: {
    position: "relative",
    minHeight: "100vh",
  },
  bgFixed: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: "url('/images/bg2.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    zIndex: -1,
  },
  container: {
    position: "relative",
    padding: "40px 20px",
    textAlign: "center",
    fontFamily: "Pretendard, sans-serif",
    minHeight: "100vh",
    justifyContent: 'center', alignItems: 'center', flexDirection: 'column'
  },
  titleImgContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: "50px"
  },
  titleImg: {
    width: "450px",
    height: "auto",
    display: "block",
    margin: "0 auto",
  },
  rankImg: {
    width: "350px",
    height: "auto",
    display: "block",
    margin: "0 auto",
  },
  topBtnGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "15px",
    maxWidth: "800px",
    margin: "0 auto 15px auto"
  },
  viewModeGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "30px",
    maxWidth: "400px",
    margin: "0 auto 30px auto"
  },
  tab: {
    flex: 1,
    padding: "12px",
    fontSize: "15px", fontFamily: "Galmuri11",
    backgroundColor: "white",
    color: "#555",
    border: "1px solid #ddd",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s"
  },
  activeTab: {
    flex: 1,
    padding: "12px",
    fontSize: "15px", fontFamily: "Galmuri11",
    backgroundColor: "#c36fff",
    color: "white",
    border: "1px solid #c36fff",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 4px 10px rgba(0,123,255,0.2)"
  },
  homeTabBtn: {
    flex: 1,
    padding: "12px",
    fontSize: "15px", fontFamily: "Galmuri11",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  modeBtn: {
    flex: 1,
    padding: "10px",
    fontSize: "14px", fontFamily: "Galmuri11",
    backgroundColor: "white",
    color: "#555",
    border: "1px solid #ddd",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "600",
  },
  activeModeBtn: {
    flex: 1,
    padding: "10px",
    fontSize: "14px", fontFamily: "Galmuri11",
    backgroundColor: "#333",
    color: "white",
    border: "1px solid #333",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  title: {
    fontSize: "28px", fontFamily: "pixelroborobo",
    marginBottom: "50px",
    fontWeight: "800",
    color: "#333"
  },
  table: {
    margin: "0 auto",
    borderCollapse: "collapse",
    width: "100%",
    maxWidth: "900px",
    backgroundColor: "white",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    borderRadius: "15px",
    overflow: "hidden"
  },
  theadRow: {
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #eee",
    height: "50px", fontFamily: "Galmuri11",
  },
  tr: {
    borderBottom: "1px solid #f1f1f1",
    height: "50px", fontFamily: "Galmuri9",
  },
  first: {
    backgroundColor: "#fff9c4",
    fontWeight: "bold", fontFamily: "Galmuri9",
  },
  timeCell: {
    fontSize: "12px",
    color: "#999"
  }
};

export default Scoreboard;