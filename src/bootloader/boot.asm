; Phase 3 Week 25-28: x86-64 Bootloader
;
; BIOS에서 직접 실행되는 부트로더
; 작성: 2026-03-06

[BITS 16]
[ORG 0x7C00]

; ============================================
; BIOS 부트로더 (MBR, 512 bytes)
; ============================================

boot_start:
  jmp real_start

; 부트 섹터 정보 (FAT32)
bpb:
  db 0x00              ; 부트 진입점
  db 'FREELANG'        ; OEM 이름
  dw 512               ; 섹터 크기
  db 1                 ; 클러스터 섹터
  dw 1                 ; 예약된 섹터
  db 2                 ; FAT 개수
  dw 0                 ; 루트 디렉토리 항목
  dw 0                 ; 작은 섹터 수
  db 0xF8              ; 미디어 디스크립터
  dw 9                 ; FAT 크기
  dw 0                 ; 헤드당 섹터
  dw 2                 ; 헤드 수
  dd 0                 ; 숨겨진 섹터

real_start:
  ; 16-bit 실모드 초기화
  cli                  ; 인터럽트 비활성화
  cld                  ; 방향 플래그 정리

  ; 세그먼트 레지스터 초기화
  xor ax, ax
  mov ds, ax
  mov es, ax
  mov ss, ax
  mov sp, 0x7C00

  ; A20 라인 활성화
  ; (1MB 이상 메모리 접근 가능하게 함)
  call enable_a20

  ; 메모리 정보 읽기 (INT 0x15/E820)
  call get_memory_map

  ; 32-bit 모드로 전환
  cli
  lgdt [gdt_descriptor]
  mov eax, cr0
  or eax, 1
  mov cr0, eax

  ; 32-bit 코드 세그먼트로 점프
  jmp 0x08:protected_mode

; ============================================
; A20 라인 활성화
; ============================================

enable_a20:
  ; PS/2 컨트롤러를 통한 A20 활성화
  in al, 0x92
  or al, 2
  out 0x92, al
  ret

; ============================================
; 메모리 맵 읽기
; ============================================

get_memory_map:
  ; INT 0x15 E820 호출
  ; EDI = 버퍼 주소
  ; ECX = 버퍼 크기
  mov edi, 0x8000     ; 메모리 맵 위치
  xor ebx, ebx        ; 계속 토큰 = 0
  mov edx, 0x534D4150 ; 'SMAP'
  mov ecx, 24
  mov eax, 0xE820
  int 0x15
  ret

; ============================================
; GDT (Global Descriptor Table)
; ============================================

gdt_start:
  ; NULL 디스크립터
  dq 0

  ; 32-bit 코드 세그먼트
  dw 0xFFFF           ; 크기
  dw 0x0000           ; 베이스 (낮은 2바이트)
  db 0x00             ; 베이스 (중간 1바이트)
  db 0x9A             ; 접근 바이트
  db 0xCF             ; 플래그 및 크기
  db 0x00             ; 베이스 (높은 1바이트)

  ; 32-bit 데이터 세그먼트
  dw 0xFFFF
  dw 0x0000
  db 0x00
  db 0x92
  db 0xCF
  db 0x00

gdt_end:

gdt_descriptor:
  dw gdt_end - gdt_start - 1
  dd gdt_start

; ============================================
; 32-bit 보호 모드
; ============================================

[BITS 32]

protected_mode:
  ; 데이터 세그먼트 초기화
  mov eax, 0x10       ; 데이터 세그먼트 선택자
  mov ds, eax
  mov es, eax
  mov ss, eax

  ; 스택 설정
  mov esp, 0x7C00

  ; 커널로 점프
  jmp 0x100000        ; 커널 베이스 주소

; ============================================
; 부팅 불가능 서명
; ============================================

times 510 - ($ - $$) db 0x00
dw 0xAA55            ; 부트 섹터 서명
