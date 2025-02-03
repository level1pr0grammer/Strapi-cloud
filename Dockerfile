# ตั้งค่า Node.js
FROM node:18

# ตั้งค่าไดเรกทอรีทำงานใน Container
WORKDIR /app

# คัดลอกไฟล์สำคัญไปยัง Container
COPY package.json package-lock.json ./

# ติดตั้ง dependencies โดยไม่เช็ก peer dependencies
RUN npm install --legacy-peer-deps

# คัดลอกโค้ดโปรเจกต์ทั้งหมดไปยัง Container
COPY . .

# รันแอป
CMD ["npm", "start"]
