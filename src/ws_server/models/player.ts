import * as types from '../../interfaces';
import { activeSockets, wsServer } from '..';
import { WebSocket } from 'ws';
export let registeredUsers: User[] = [];

export interface Player {
    index: number | string;
    name: string;
}

export class User implements Player {
    index: number;
    name: string;
    password: string;
    wins: number;
    losses: number;

    constructor(name: string, password: string) {
      this.index = registeredUsers.length;
      this.name = name;
      this.password = password;
      this.wins = 0;
      this.losses = 0;
    }

    addWin() {
        this.wins++;
    }

    addLoss() {
        this.losses++;
    }
  }

  export function updateSocket(userId: number, socket: WebSocket) {
    if (activeSockets.has(userId)) {
      const oldSocket = activeSockets.get(userId);
      oldSocket?.close();
    }

    activeSockets.set(userId, socket);
    console.log(`WebSocket was refreshed for the user ${userId}`);
  }

export function findUserByName(name: string): User | undefined {
    return registeredUsers.find(user => user.name === name);
  }


export function validatePassword(name: string, password: string): boolean {
    const user = findUserByName(name);
    if (!user) {
      registeredUsers.push(new User(name, password))
      return true;
    }
    const isValid = user.password === password;
    return isValid;
  }

export function updateWinners() {
    let scoreTable: {name:string,wins:number}[] = [];
    registeredUsers.forEach(user => {
        let scoreEntry = {'name': user.name, 'wins': user.wins};
        scoreTable.push(scoreEntry)
    });
    let response: types.reqOutputInt = new types.Response('update_winners', JSON.stringify(scoreTable.sort((a, b) => b.wins - a.wins)));
    wsServer.broadcast(JSON.stringify(response))
}

export function cleanUser(user:Player){
    let cleanUser = {name: user.name, index:user.index};
    return cleanUser;
}

export function currentUser(socket: WebSocket): Player | undefined {

    const userId = [...activeSockets.entries()].find(([_, s]) => s === socket)?.[0];
    if (userId !== undefined) {
      return registeredUsers[userId];
    }
    return undefined;
  }