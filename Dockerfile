# ใช้ Node.js 22.12 เป็น base image
FROM node:22.12

# กำหนด working directory
WORKDIR /app

# คัดลอกไฟล์ package.json และ package-lock.json
COPY package.json package-lock.json ./

# ติดตั้ง dependencies (เฉพาะ production dependencies เพื่อลดขนาด image)
RUN npm install --omit=dev

RUN npm install node-cron
RUN npm install pg --save
RUN npm run build

# คัดลอกโค้ดทั้งหมดไปยัง container
COPY . .

# กำหนดพอร์ตที่ใช้
EXPOSE 80

# คำสั่งสำหรับรัน Strapi
CMD ["npm", "start"]