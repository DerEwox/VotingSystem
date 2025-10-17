<script>
    import { onMount } from 'svelte';
    import { db } from '../../../lib/firebase.js';
    import { collection, getDocs } from 'firebase/firestore';
  
    let votes = [];
    let totalVotes = 0;
    let totalFirstVotes = 0;
    let options = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5', 'Option 6'];
    let voteCounts = new Array(options.length).fill(0);
  
    onMount(async () => {
      const votesCollection = collection(db, 'votes');
      const snapshot = await getDocs(votesCollection);
      const allVotes = snapshot.docs.map(doc => doc.data());
  
      totalFirstVotes = allVotes.length;
      const secondVoteEntries = allVotes.filter(doc => doc.secondVote !== undefined);
      totalVotes = secondVoteEntries.length;
      
      votes = secondVoteEntries.map(doc => doc.secondVote);
  
      votes.forEach(vote => {
        if (vote >= 0 && vote < options.length) {
          voteCounts[vote]++;
        }
      });
    });
  </script>
  
  <main>
    <h1>Vote Auswertung</h1>
    <p>Gesamtstimmen erste Wahl: {totalFirstVotes}</p>
    <p style="margin-top: 0; margin-bottom: 50px">Gesamtstimmen diese Wahl: {totalVotes}</p>
    
    {#each options as option, index}
      <div class="vote-container">
        <p>{option}: {voteCounts[index]} Stimmen</p>
        <div class="progress-bar">
          <div class="progress" style="width: {totalVotes > 0 ? (voteCounts[index] / totalVotes) * 100 + '%' : '0%'}"></div>
        </div>
      </div>
    {/each}
  </main>
  
  <style>
    main {
      font-family: Arial, sans-serif;
      text-align: center;
      max-width: 600px;
      margin: 20px auto;
      background: #f9f9f9;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
  
    h1 {
      color: #333;
    }
  
    .vote-container {
      margin: 15px 0;
    }
  
    .progress-bar {
      width: 100%;
      height: 20px;
      background: #e0e0e0;
      border-radius: 10px;
      overflow: hidden;
    }
  
    .progress {
      height: 100%;
      background: linear-gradient(90deg, #ff5722, #ff9800);
      transition: width 0.5s ease-in-out;
    }
  
    p {
      font-size: 16px;
      color: #444;
      margin-bottom: 5px;
    }
  </style>